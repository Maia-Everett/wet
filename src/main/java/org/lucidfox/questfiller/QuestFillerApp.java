package org.lucidfox.questfiller;

import java.io.IOException;
import java.util.Arrays;

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
		
		final AppController appController = new AppController(primaryStage);
		appController.showUI();
	}

	public static void main(final String[] args) {
		launch(args);
	}
}
