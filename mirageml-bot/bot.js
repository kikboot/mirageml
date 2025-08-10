const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Конфигурация
const token = '8389665707:AAFiKYkPV0ELjqx_lGr-29B58djM-QY9i3E';
const bot = new TelegramBot(token, { polling: true });
const adminId = '5557423238'; // Ваш ID в Telegram
const channelId = '@MirageML_Official'; // Официальный канал
const feedbackFile = 'feedback.txt';

// Хранилище данных
const userStates = {};
const feedbackUsers = {}; // Для хранения соответствия пользователей и их ID

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code} - ${error.message}`);
});

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            keyboard: [
                ['/feedback - Оставить отзыв'],
                ['/status - Проверить серверы'],
                ['/help - Помощь']
            ],
            resize_keyboard: true
        }
    };
    sendSafeMessage(chatId, '👋 Привет! Я официальный бот MirageML. Чем могу помочь?', options);
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const helpText = `
📌 Доступные команды:
/feedback - Оставить отзыв или предложение
/status - Проверить статус серверов
/help - Получить справку
`;
    sendSafeMessage(msg.chat.id, helpText);
});

// Обработка feedback
bot.onText(/\/feedback/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = 'awaiting_feedback';
    feedbackUsers[chatId] = {
        id: chatId,
        username: msg.from.username || 'нет',
        first_name: msg.from.first_name,
        last_name: msg.from.last_name || ''
    };
    sendSafeMessage(chatId, '📝 Пожалуйста, напишите ваш отзыв или предложение:');
});

// Обработка всех сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // Обработка feedback
    if (userStates[chatId] === 'awaiting_feedback' && !text.startsWith('/')) {
        const user = feedbackUsers[chatId];
        const feedback = `От: ${user.first_name} ${user.last_name} (@${user.username})\nID: ${user.id}\n\n${text}`;

        // Сохраняем в файл
        fs.appendFileSync(feedbackFile, `${new Date().toISOString()}:\n${feedback}\n\n`);

        // Отправляем админу с кнопкой ответа
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Ответить", callback_data: `reply_${user.id}` }]
                ]
            }
        };
        sendSafeMessage(adminId, `📩 Новый отзыв:\n\n${feedback}`, options);

        // Подтверждаем пользователю
        sendSafeMessage(chatId, '✅ Спасибо за ваш отзыв! Мы его рассмотрим.');
        delete userStates[chatId];
    }

    // Команда для админа - рассылка
    if (chatId == adminId && text.startsWith('/announce ')) {
        const announcement = text.replace('/announce ', '');
        sendSafeMessage(channelId, `🔔 Официальное объявление:\n\n${announcement}`)
            .then(() => sendSafeMessage(adminId, '✅ Объявление отправлено в канал!'))
            .catch(err => sendSafeMessage(adminId, `❌ Ошибка отправки: ${err.message}`));
    }
});

// Обработка inline-кнопки "Ответить"
bot.on('callback_query', (query) => {
    if (query.data.startsWith('reply_')) {
        const userId = query.data.split('_')[1];
        bot.answerCallbackQuery(query.id);
        sendSafeMessage(adminId, `Введите ответ для пользователя (ID: ${userId}):`);
        userStates[adminId] = `replying_${userId}`;
    }
});

// Обработка ответа администратора
bot.on('message', (msg) => {
    if (msg.chat.id == adminId && userStates[adminId] && userStates[adminId].startsWith('replying_')) {
        const userId = userStates[adminId].split('_')[1];
        const replyText = msg.text;

        sendSafeMessage(userId, `📨 Ответ от поддержки MirageML:\n\n${replyText}`)
            .then(() => {
                sendSafeMessage(adminId, `✅ Ответ отправлен пользователю (ID: ${userId})`);
                delete userStates[adminId];
            })
            .catch(err => {
                sendSafeMessage(adminId, `❌ Не удалось отправить ответ: ${err.message}\nПользователь возможно заблокировал бота.`);
                delete userStates[adminId];
            });
    }
});

// Команда /status
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const response = await axios.get('https://api.mirageml.com/health');
        sendSafeMessage(chatId, `🟢 Серверы работают. Статус: ${response.data.status}\nПоследняя проверка: ${new Date().toLocaleString()}`);
    } catch (error) {
        sendSafeMessage(chatId, '🔴 Ошибка! Серверы недоступны.');
    }
});

// Статистика (только для админа)
bot.onText(/\/stats/, (msg) => {
    if (msg.chat.id == adminId) {
        try {
            const feedbacks = fs.existsSync(feedbackFile) ? fs.readFileSync(feedbackFile, 'utf-8') : '';
            const count = (feedbacks.match(/От:/g) || []).length;
            sendSafeMessage(adminId, `📊 Статистика:\n\nОтзывов получено: ${count}\n\nПоследние 3 отзыва:\n${getLastFeedbacks(3)}`);
        } catch (e) {
            sendSafeMessage(adminId, '📊 Статистика: Отзывов пока нет');
        }
    }
});

// Функция для безопасной отправки сообщений
function sendSafeMessage(chatId, text, options) {
    return bot.sendMessage(chatId, text, options)
        .catch(err => {
            console.error(`Ошибка отправки сообщения ${chatId}: ${err.message}`);
            if (chatId == adminId) {
                // Если не удалось отправить админу, выводим в консоль
                console.log(`Неотправленное сообщение для ${chatId}: ${text}`);
            }
        });
}

// Функция для получения последних отзывов
function getLastFeedbacks(count) {
    try {
        if (!fs.existsSync(feedbackFile)) return 'Нет данных';

        const content = fs.readFileSync(feedbackFile, 'utf-8');
        const feedbacks = content.split('\n\n').filter(f => f.trim());
        return feedbacks.slice(-count).join('\n\n----------\n');
    } catch (e) {
        return 'Ошибка чтения файла';
    }
}

console.log('🤖 Бот MirageML запущен...');
sendSafeMessage(adminId, '🤖 Бот MirageML успешно запущен!');