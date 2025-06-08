import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QWidget, QLineEdit, QCheckBox, QPushButton, QLabel, QFrame)
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt
from database import DatabaseManager

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Bibliothèque Inspirée")
        self.setGeometry(100, 100, 1200, 800)

        # Set parchment-style background
        self.setStyleSheet("background-color: #f5deb3;")

        # Main layout
        main_layout = QVBoxLayout()

        # Search bar layout
        search_layout = QHBoxLayout()
        self.search_bar = QLineEdit()
        # self.search_bar.setText("r[a-z]verso")
        self.search_bar.setText("guardia di testa")
        self.search_bar.setFont(QFont("Times New Roman", 14))
        self.search_bar.setStyleSheet("background-color: #fff8dc; border: 1px solid #8b4513;")
        search_layout.addWidget(self.search_bar)

        main_layout.addLayout(search_layout)

        # Filter layout
        filter_layout = QHBoxLayout()
        self.filter_checkbox = QCheckBox("Limiter aux éléments filtrés")
        self.filter_checkbox.setFont(QFont("Times New Roman", 12))
        filter_layout.addWidget(self.filter_checkbox)

        self.filter_button = QPushButton("Filtres")
        self.filter_button.setFont(QFont("Times New Roman", 12))
        self.filter_button.setStyleSheet("background-color: #d2b48c; border: 1px solid #8b4513;")
        filter_layout.addWidget(self.filter_button)

        main_layout.addLayout(filter_layout)

        # Results layout
        results_layout = QHBoxLayout()

        self.italian_panel = self.create_result_panel("Italien")
        self.french_panel = self.create_result_panel("Français")
        self.english_panel = self.create_result_panel("Anglais")

        results_layout.addWidget(self.italian_panel)
        results_layout.addWidget(self.french_panel)
        results_layout.addWidget(self.english_panel)

        main_layout.addLayout(results_layout)

        # Central widget
        central_widget = QWidget()
        central_widget.setLayout(main_layout)
        self.setCentralWidget(central_widget)

        # Initialize database manager
        self.db_manager = DatabaseManager()
        self.db_manager.connect()
        self.db_manager.create_tables()

        # Connect search bar to search function
        self.search_bar.returnPressed.connect(self.perform_search)

    def perform_search(self):
        regex = self.search_bar.text()
        limit_to_filtered = self.filter_checkbox.isChecked()

        # Perform search for each language
        # italian_results = self.db_manager.search_entries(regex, language="it")
        french_results = self.db_manager.search_entries(regex, language="fr")
        # english_results = self.db_manager.search_entries(regex, language="en")

        # Update panels with results
        # self.update_panel(self.italian_panel, italian_results)
        self.update_panel(self.french_panel, french_results)
        # self.update_panel(self.english_panel, english_results)

    def update_panel(self, panel, results):
        layout = panel.layout()

        # Clear existing widgets
        while layout.count() > 1:
            widget = layout.takeAt(1).widget()
            if widget:
                widget.deleteLater()

        # Add new results
        for result in results:
            label = QLabel(result[1])
            label.setFont(QFont("Times New Roman", 12))
            layout.addWidget(label)

    def create_result_panel(self, title):
        panel = QFrame()
        panel.setFrameShape(QFrame.StyledPanel)
        panel.setStyleSheet("background-color: #fff8dc; border: 1px solid #8b4513;")

        layout = QVBoxLayout()
        label = QLabel(title)
        label.setFont(QFont("Times New Roman", 16, QFont.Bold))
        label.setAlignment(Qt.AlignCenter)
        layout.addWidget(label)

        panel.setLayout(layout)
        return panel

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())