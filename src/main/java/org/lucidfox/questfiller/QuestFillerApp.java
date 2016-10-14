package org.lucidfox.questfiller;

import java.io.IOException;
import java.util.Arrays;
import java.util.prefs.Preferences;

import org.lucidfox.questfiller.controller.AppController;
import org.lucidfox.questfiller.ui.MainWindow;

import javafx.application.Application;
import javafx.scene.text.Font;
import javafx.stage.Stage;

public class QuestFillerApp extends Application {
	@Override
	public void start(final Stage primaryStage) throws IOException {
		for (final String fontName : Arrays.asList("NotoSans-Regular", "UbuntuMono-R")) {
			Font.loadFont(MainWindow.class.getResource("fonts/" + fontName + ".ttf").toExternalForm(), 0);
		}
		
		// Load stored window size
		final Preferences prefs = Preferences.userNodeForPackage(QuestFillerApp.class);
		final boolean maximized = prefs.getBoolean("windowMaximized", false);
		final int width = prefs.getInt("windowWidth", 900);
		final int height = prefs.getInt("windowHeight", 600);
		
		primaryStage.setWidth(width);
		primaryStage.setHeight(height);
		primaryStage.setMaximized(maximized);
		primaryStage.setOnHiding(e -> {
			// Save new window size
			prefs.putBoolean("windowMaximized", primaryStage.isMaximized());
			prefs.putInt("windowWidth", (int) primaryStage.getWidth());
			prefs.putInt("windowHeight", (int) primaryStage.getHeight());
		});
		
		final AppController appController = new AppController(primaryStage);
		appController.showUI();
	}

	public static void main(final String[] args) {
		launch(args);
	}
}
