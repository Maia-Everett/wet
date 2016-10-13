package org.lucidfox.questfiller.controller;

import java.io.IOException;

import org.lucidfox.questfiller.ui.MainWindow;

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
		mainWindow.setOnClose(e -> primaryStage.close());

		// Customize main window
		primaryStage.setTitle("Quest Filler");
		primaryStage.getIcons().add(new Image(MainWindow.class.getResource("icon.png").toExternalForm()));
		primaryStage.setScene(scene);
		
		// Window close handler - clean up after ourselves
		primaryStage.setOnHidden(e -> {
			
		});
	}

	public void showUI() {
		primaryStage.show();
		primaryStage.centerOnScreen();
	}
	
	private void doLoad() {
		
	}
}
