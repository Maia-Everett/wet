package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

import org.jsoup.Jsoup;
import org.lucidfox.questfiller.ui.MainWindow;

import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.stage.Stage;

public class AppController {
	private final Stage primaryStage;
	private final CompletableFuture<WowheadParser> parserInit;
	
	private MainWindow mainWindow;
	
	public AppController(final Stage primaryStage)
			throws IOException {
		this.primaryStage = primaryStage;
		createUI(new FXMLLoader());
		
		parserInit = CompletableFuture.supplyAsync(() -> {
			// Worker thread
			final String url = "http://wow.zamimg.com/js/locale_enus.js";
			
			try (final Reader reader = new InputStreamReader(new URL(url).openStream(), StandardCharsets.UTF_8)) {
				return new WowheadParser(reader);
			} catch (final IOException e) {
				throw new UncheckedIOException(e);
			}
		});
	}

	private void createUI(final FXMLLoader loader) throws IOException {
		loader.setLocation(MainWindow.class.getResource("MainWindow.fxml"));

		Scene scene = new Scene((Pane) loader.load());
		scene.getStylesheets().add(MainWindow.class.getResource("application.css").toExternalForm());
		
		// Button handlers
		mainWindow = loader.getController();
		mainWindow.setOnClose(primaryStage::close);
		mainWindow.setOnLoad(this::doLoad);

		// Customize main window
		primaryStage.setTitle("Quest Filler");
		primaryStage.getIcons().add(new Image(MainWindow.class.getResource("icon.png").toExternalForm()));
		primaryStage.setScene(scene);
	}

	public void showUI() {
		primaryStage.show();
		primaryStage.centerOnScreen();
	}
	
	private void doLoad(final String url) {
		if (url.isEmpty()) {
			return;
		}
		
		try {
			new URL(url);
		} catch (final MalformedURLException e) {
			mainWindow.showError(new IOException("Invalid URL", e));
			return;
		}
		
		mainWindow.setLoading(true);
		
		parserInit.thenApplyAsync(parser -> {
			// Worker thread
			try {
				return parser.parse(Jsoup.connect(url).get());
			} catch (final IOException e) {
				throw new UncheckedIOException(e);
			}
		}).handleAsync((quest, e) -> {
			// UI thread
			mainWindow.setLoading(false);
			
			if (e != null) {
				mainWindow.showError(e);
				return null;
			}
			
			try {
				mainWindow.setText(new ArticleFormatter().format(quest));
			} catch (final RuntimeException ex) {
				mainWindow.showError(ex);
			}
			
			return null;
		}, Platform::runLater);
	}
}
