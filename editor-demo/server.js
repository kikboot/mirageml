const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Статические файлы из editor-demo
app.use(express.static(path.join(__dirname)));

// Статические файлы из mirageml-frontend (для логотипов)
app.use('/mirageml-frontend', express.static(path.join(__dirname, '../mirageml-frontend')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎨 MirageML Editor Demo запущен!                        ║
║                                                           ║
║   ➤ Откройте: http://localhost:${PORT}                     ║
║                                                           ║
║   Функционал:                                             ║
║   • Drag-and-drop секций из левой панели                 ║
║   • Клик для добавления секции                           ║
║   • Панель слоёв с управлением порядком                  ║
║   • Панель свойств для редактирования                    ║
║   • Экспорт в HTML/CSS                                   ║
║   • Предпросмотр                                         ║
║   • Undo/Redo (Ctrl+Z / Ctrl+Y)                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
