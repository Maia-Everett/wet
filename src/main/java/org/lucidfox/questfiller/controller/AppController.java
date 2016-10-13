package org.lucidfox.questfiller.controller;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.concurrent.CompletableFuture;

import org.jsoup.Jsoup;
import org.lucidfox.questfiller.model.Quest;
import org.lucidfox.questfiller.ui.MainWindow;

import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import javafx.stage.Stage;

public class AppController {
	private final Stage primaryStage;
	
	private MainWindow mainWindow;
	
	public AppController(final Stage primaryStage)
			throws IOException {
		this.primaryStage = primaryStage;
		createUI(new FXMLLoader());
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
		
		mainWindow.setLoading(true);
		
		CompletableFuture.supplyAsync(() -> {
			// Worker thread
			try {
				return Jsoup.connect(url).get();
			} catch (final IOException e) {
				throw new UncheckedIOException(e);
			}
		}).handleAsync((document, e) -> {
			// UI thread
			mainWindow.setLoading(false);
			
			if (e != null) {
				mainWindow.showError(e);
				return null;
			}
			
			final Quest quest = new WowheadParser().parse(document);
			mainWindow.setText(new ArticleFormatter().format(quest));	
			return null;
		}, Platform::runLater);
	}
}
