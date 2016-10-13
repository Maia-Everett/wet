package org.lucidfox.questfiller.ui;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Button;
import javafx.scene.control.ProgressIndicator;

public class MainWindow {
	@FXML
	private Button closeBtn;
	
	@FXML
	private ProgressIndicator loading;
	
	public void setOnClose(final EventHandler<ActionEvent> handler) {
		closeBtn.setOnAction(handler);
	}
	
	public void setLoading(final boolean isLoading) {
		loading.setVisible(isLoading);
	}
	
	public void showError(final Throwable e) {
		new Alert(AlertType.ERROR, e.getMessage()).showAndWait();
	}
}
