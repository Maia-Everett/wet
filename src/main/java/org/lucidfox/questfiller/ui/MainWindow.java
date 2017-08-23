package org.lucidfox.questfiller.ui;

import java.io.UncheckedIOException;
import java.util.concurrent.CompletionException;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.lucidfox.questfiller.parser.ParserType;

import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.Alert.AlertType;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.input.Clipboard;
import javafx.scene.input.ClipboardContent;

public class MainWindow {
	@FXML
	private Button closeBtn;
	
	@FXML
	private ProgressIndicator loading;
	
	@FXML
	private TextField wowheadUrl;

	@FXML
	private Button copyBtn;

	@FXML
	private Button loadBtn;
	
	@FXML
	private Label supportedArticleTypes;
	
	@FXML
	private TextArea textArea;
	
	@FXML
	public void initialize() {
		copyBtn.setOnAction(e -> {
			final ClipboardContent content = new ClipboardContent();
			content.putString(textArea.getText());
			Clipboard.getSystemClipboard().setContent(content);
		});

		// Select the entire URL on focus gain
		wowheadUrl.focusedProperty().addListener((ChangeListener<Boolean>) (value, oldValue, newValue) -> {
			if (newValue) {
				Platform.runLater(wowheadUrl::selectAll);
			}
		});
		
		supportedArticleTypes.setText("Supported article types: "
				+ Stream.of(ParserType.values()).map(Object::toString).collect(Collectors.joining(", ")));
	}
	
	public void setOnClose(final Runnable handler) {
		closeBtn.setOnAction(e -> handler.run());
	}
	
	public void setLoading(final boolean isLoading) {
		wowheadUrl.setEditable(!isLoading);
		loadBtn.setDisable(isLoading);
		loading.setVisible(isLoading);
	}
	
	public void setOnLoad(final Consumer<String> handler) {
		loadBtn.setOnAction(e -> handler.accept(wowheadUrl.getText()));
		wowheadUrl.setOnAction(e -> handler.accept(wowheadUrl.getText()));
	}
	
	public void setText(final String text) {
		textArea.setText(text);
	}
	
	public void showError(final Throwable e) {
		Throwable realEx = e;
		
		while (realEx instanceof UncheckedIOException || realEx instanceof CompletionException) {
			realEx = realEx.getCause();
		}
		
		final StringBuilder sb = new StringBuilder(realEx.toString());
		sb.append("\n\n");
		
		for (final StackTraceElement st : realEx.getStackTrace()) {
			sb.append(st.toString());
			sb.append("\n");
		}
		
		final String message = sb.toString();
		
		final Alert alert = new Alert(AlertType.ERROR, message);
		alert.setResizable(true);
		alert.showAndWait();
	}
}
