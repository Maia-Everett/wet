package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.CompletableFuture;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.lucidfox.questfiller.parser.ParserContext;
import org.lucidfox.questfiller.ui.MainWindow;

import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.stage.Stage;

public class AppController {
	private final Stage primaryStage;
	private final CompletableFuture<ParserContext> parserInit;
	
	private MainWindow mainWindow;
	
	public AppController(final Stage primaryStage) throws IOException {
		this.primaryStage = primaryStage;
		createUI(new FXMLLoader());
		
		parserInit = CompletableFuture.supplyAsync(() -> {
			// Worker thread
			try  {
				return ParserContext.load();
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
		primaryStage.setTitle("Wowhead to Wowpedia Article Converter");
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
		
		parserInit.thenApplyAsync(context -> {
			// Worker thread
			try {
				final Document htmlDoc = Jsoup.connect(url).userAgent(ParserContext.USER_AGENT).get();
				return new ArticleFormatter().format(htmlDoc, context);
			} catch (final IOException e) {
				throw new UncheckedIOException(e);
			}
		}).handleAsync((wikitext, e) -> {
			// UI thread
			mainWindow.setLoading(false);
			
			if (e != null) {
				mainWindow.showError(e);
				return null;
			}
			
			try {
				mainWindow.setText(wikitext);
			} catch (final RuntimeException ex) {
				mainWindow.showError(ex);
			}
			
			return null;
		}, Platform::runLater);
	}
}
