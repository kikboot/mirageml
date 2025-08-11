const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Конфигурация
const token = '8389665707:AAFaqfO2dQ2sCkltwh-XhDN3GayNGlkKxsc';
const bot = new TelegramBot(token, { polling: true });
const adminId = '5557423238';
const channelId = '@MirageML_Official';
const feedbackFile = 'feedback.txt';
const mediaFolder = 'media';

// Создаем папку для медиа
if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder);
}

// Хранилище данных
const userStates = {};
const feedbackUsers = {};
const tempMediaStorage = {};
const adminReplies = {};

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
/feedback - Оставить отзыв или предложение (можно прикрепить фото, видео или аудио)
/status - Проверить статус серверов
/help - Получить справку

Для администратора:
/announce - Сделать объявление в канал (с медиа)
/stats - Просмотреть статистику
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
    sendSafeMessage(chatId, '📝 Пожалуйста, напишите ваш отзыв или предложение. Вы также можете прикрепить фото, видео или аудио сообщение:');
});

// Обработка всех сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const caption = msg.caption || '';

    // Обработка feedback с медиа
    if (userStates[chatId] === 'awaiting_feedback' && (text || msg.photo || msg.video || msg.audio || msg.voice || msg.document)) {
        await handleUserFeedback(msg);
    }

    // Обработка ответа от администратора с медиа
    if (chatId == adminId && userStates[adminId] && userStates[adminId].startsWith('replying_media_')) {
        await handleAdminMediaReply(msg);
    }

    // Обработка текстового ответа от администратора
    if (chatId == adminId && userStates[adminId] && userStates[adminId].startsWith('replying_text_')) {
        await handleAdminTextReply(msg);
    }

    // Команда для админа - рассылка с медиа
    if (chatId == adminId && text.startsWith('/announce ')) {
        const announcement = text.replace('/announce ', '');
        await sendAnnouncement(announcement);
    }

    // Обработка команды /announce
    if (chatId == adminId && userStates[adminId] === 'awaiting_announce_text' && text && !text.startsWith('/')) {
        await handleAnnounceText(msg);
    }

    // Обработка медиа для /announce
    if (chatId == adminId && userStates[adminId] === 'awaiting_announce_media') {
        await handleAnnounceMedia(msg);
    }
});

// Обработка inline-кнопок
bot.on('callback_query', async (query) => {
    if (query.data.startsWith('reply_text_')) {
        const userId = query.data.split('_')[2];
        bot.answerCallbackQuery(query.id);
        sendSafeMessage(adminId, `Введите текстовый ответ для пользователя (ID: ${userId}):`);
        userStates[adminId] = `replying_text_${userId}`;
    }

    if (query.data.startsWith('reply_media_')) {
        const userId = query.data.split('_')[2];
        bot.answerCallbackQuery(query.id);
        sendSafeMessage(adminId, `Отправьте фото, видео, аудио или голосовое сообщение в ответ пользователю (ID: ${userId}). Вы можете добавить подпись к медиа.`);
        userStates[adminId] = `replying_media_${userId}`;
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

// Статистика
bot.onText(/\/stats/, async (msg) => {
    if (msg.chat.id == adminId) {
        try {
            const feedbacks = fs.existsSync(feedbackFile) ? fs.readFileSync(feedbackFile, 'utf-8').split('\n').filter(Boolean) : [];
            const count = feedbacks.length;
            const mediaStats = {
                photo: 0,
                video: 0,
                audio: 0,
                voice: 0,
                document: 0
            };

            feedbacks.forEach(f => {
                try {
                    const entry = JSON.parse(f);
                    if (entry.media) {
                        mediaStats[entry.media.type]++;
                    }
                } catch (e) {
                    console.error('Error parsing feedback entry:', e);
                }
            });

            const statsText = `📊 Статистика:
Отзывов получено: ${count}
Из них с медиа:
  Фото: ${mediaStats.photo}
  Видео: ${mediaStats.video}
  Аудио: ${mediaStats.audio}
  Голосовых: ${mediaStats.voice}
  Документов: ${mediaStats.document}

Последние 3 отзыва:
${getLastFeedbacks(3)}`;

            await sendSafeMessage(adminId, statsText);
        } catch (e) {
            console.error('Stats error:', e);
            await sendSafeMessage(adminId, '📊 Статистика: Ошибка при получении данных');
        }
    }
});

// Асинхронные функции для обработки

async function handleUserFeedback(msg) {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const caption = msg.caption || '';
    const user = feedbackUsers[chatId];
    let feedbackContent = `От: ${user.first_name} ${user.last_name} (@${user.username})\nID: ${user.id}\n\n`;
    let mediaFileId = null;
    let mediaType = null;

    if (msg.photo) {
        mediaFileId = msg.photo[msg.photo.length - 1].file_id;
        mediaType = 'photo';
        feedbackContent += caption || 'Фото отзыв';
    } else if (msg.video) {
        mediaFileId = msg.video.file_id;
        mediaType = 'video';
        feedbackContent += caption || 'Видео отзыв';
    } else if (msg.audio) {
        mediaFileId = msg.audio.file_id;
        mediaType = 'audio';
        feedbackContent += caption || 'Аудио отзыв';
    } else if (msg.voice) {
        mediaFileId = msg.voice.file_id;
        mediaType = 'voice';
        feedbackContent += 'Голосовое сообщение';
    } else if (msg.document) {
        mediaFileId = msg.document.file_id;
        mediaType = 'document';
        feedbackContent += caption || 'Документ';
    } else {
        feedbackContent += text;
    }

    const feedbackEntry = {
        date: new Date().toISOString(),
        user: user,
        content: feedbackContent,
        media: mediaFileId ? { file_id: mediaFileId, type: mediaType } : null
    };

    fs.appendFileSync(feedbackFile, JSON.stringify(feedbackEntry) + '\n');

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Ответить текстом", callback_data: `reply_text_${user.id}` },
                    { text: "Ответить медиа", callback_data: `reply_media_${user.id}` }
                ]
            ]
        }
    };

    if (mediaFileId) {
        try {
            const fileStream = await bot.getFileStream(mediaFileId);
            const filePath = path.join(mediaFolder, `${mediaFileId}.${mediaType}`);
            const writer = fs.createWriteStream(filePath);

            fileStream.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            tempMediaStorage[mediaFileId] = { path: filePath, type: mediaType };

            switch (mediaType) {
                case 'photo':
                    await bot.sendPhoto(adminId, mediaFileId, { caption: feedbackContent, ...options });
                    break;
                case 'video':
                    await bot.sendVideo(adminId, mediaFileId, { caption: feedbackContent, ...options });
                    break;
                case 'audio':
                    await bot.sendAudio(adminId, mediaFileId, { caption: feedbackContent, ...options });
                    break;
                case 'voice':
                    await bot.sendVoice(adminId, mediaFileId, { caption: feedbackContent, ...options });
                    break;
                case 'document':
                    await bot.sendDocument(adminId, mediaFileId, { caption: feedbackContent, ...options });
                    break;
            }
        } catch (err) {
            console.error('Ошибка при обработке медиа:', err);
            await sendSafeMessage(adminId, `📩 Новый отзыв (ошибка медиа):\n\n${feedbackContent}`, options);
        }
    } else {
        await sendSafeMessage(adminId, `📩 Новый отзыв:\n\n${feedbackContent}`, options);
    }

    await sendSafeMessage(chatId, '✅ Спасибо за ваш отзыв! Мы его рассмотрим.');
    delete userStates[chatId];
}

async function handleAdminMediaReply(msg) {
    const userId = userStates[adminId].split('_')[2];
    let mediaFileId = null;
    let mediaType = null;
    let caption = msg.caption || 'Ответ от поддержки MirageML';

    if (msg.photo) {
        mediaFileId = msg.photo[msg.photo.length - 1].file_id;
        mediaType = 'photo';
    } else if (msg.video) {
        mediaFileId = msg.video.file_id;
        mediaType = 'video';
    } else if (msg.audio) {
        mediaFileId = msg.audio.file_id;
        mediaType = 'audio';
    } else if (msg.voice) {
        mediaFileId = msg.voice.file_id;
        mediaType = 'voice';
    } else if (msg.document) {
        mediaFileId = msg.document.file_id;
        mediaType = 'document';
    }

    if (mediaFileId) {
        try {
            adminReplies[`${userId}_${Date.now()}`] = {
                file_id: mediaFileId,
                type: mediaType,
                caption: caption
            };

            switch (mediaType) {
                case 'photo':
                    await bot.sendPhoto(userId, mediaFileId, { caption: caption });
                    break;
                case 'video':
                    await bot.sendVideo(userId, mediaFileId, { caption: caption });
                    break;
                case 'audio':
                    await bot.sendAudio(userId, mediaFileId, { caption: caption });
                    break;
                case 'voice':
                    await bot.sendVoice(userId, mediaFileId, { caption: caption });
                    break;
                case 'document':
                    await bot.sendDocument(userId, mediaFileId, { caption: caption });
                    break;
            }

            await sendSafeMessage(adminId, `✅ Медиа-ответ отправлен пользователю (ID: ${userId})`);
        } catch (err) {
            await sendSafeMessage(adminId, `❌ Не удалось отправить медиа-ответ: ${err.message}\nПользователь возможно заблокировал бота.`);
        }
    } else {
        await sendSafeMessage(adminId, '❌ Не распознано медиа. Попробуйте еще раз или используйте текстовый ответ.');
    }
    delete userStates[adminId];
}

async function handleAdminTextReply(msg) {
    const userId = userStates[adminId].split('_')[2];
    const replyText = msg.text;

    if (replyText) {
        try {
            await bot.sendMessage(userId, `📨 Ответ от поддержки MirageML:\n\n${replyText}`);
            await sendSafeMessage(adminId, `✅ Ответ отправлен пользователю (ID: ${userId})`);
        } catch (err) {
            await sendSafeMessage(adminId, `❌ Не удалось отправить ответ: ${err.message}\nПользователь возможно заблокировал бота.`);
        }
        delete userStates[adminId];
    }
}

async function sendAnnouncement(announcement) {
    try {
        await bot.sendMessage(channelId, `🔔 Официальное объявление:\n\n${announcement}`);
        await sendSafeMessage(adminId, '✅ Объявление отправлено в канал!');
    } catch (err) {
        await sendSafeMessage(adminId, `❌ Ошибка отправки: ${err.message}`);
    }
}

async function handleAnnounceText(msg) {
    userStates[adminId + '_text'] = msg.text;
    userStates[adminId] = 'awaiting_announce_media';
    await sendSafeMessage(adminId, 'Теперь вы можете прикрепить медиа (фото, видео, аудио) к объявлению или отправьте "нет", чтобы продолжить без медиа.');
}

async function handleAnnounceMedia(msg) {
    if (msg.text && msg.text.toLowerCase() === 'нет') {
        const announcementText = userStates[adminId + '_text'];
        await sendAnnouncement(announcementText);
        delete userStates[adminId];
        delete userStates[adminId + '_text'];
    } else if (msg.photo || msg.video || msg.audio || msg.voice || msg.document) {
        const announcementText = userStates[adminId + '_text'];
        let mediaFileId = null;
        let mediaType = null;

        if (msg.photo) {
            mediaFileId = msg.photo[msg.photo.length - 1].file_id;
            mediaType = 'photo';
        } else if (msg.video) {
            mediaFileId = msg.video.file_id;
            mediaType = 'video';
        } else if (msg.audio) {
            mediaFileId = msg.audio.file_id;
            mediaType = 'audio';
        } else if (msg.voice) {
            mediaFileId = msg.voice.file_id;
            mediaType = 'voice';
        } else if (msg.document) {
            mediaFileId = msg.document.file_id;
            mediaType = 'document';
        }

        if (mediaFileId) {
            try {
                switch (mediaType) {
                    case 'photo':
                        await bot.sendPhoto(channelId, mediaFileId, { caption: `🔔 Официальное объявление:\n\n${announcementText}` });
                        break;
                    case 'video':
                        await bot.sendVideo(channelId, mediaFileId, { caption: `🔔 Официальное объявление:\n\n${announcementText}` });
                        break;
                    case 'audio':
                        await bot.sendAudio(channelId, mediaFileId, { caption: `🔔 Официальное объявление:\n\n${announcementText}` });
                        break;
                    case 'voice':
                        await bot.sendVoice(channelId, mediaFileId, { caption: `🔔 Официальное объявление:\n\n${announcementText}` });
                        break;
                    case 'document':
                        await bot.sendDocument(channelId, mediaFileId, { caption: `🔔 Официальное объявление:\n\n${announcementText}` });
                        break;
                }
                await sendSafeMessage(adminId, '✅ Объявление с медиа отправлено в канал!');
            } catch (err) {
                await sendSafeMessage(adminId, `❌ Ошибка отправки медиа: ${err.message}`);
            }
        }
        delete userStates[adminId];
        delete userStates[adminId + '_text'];
    }
}

// Функция для безопасной отправки сообщений
async function sendSafeMessage(chatId, text, options) {
    try {
        await bot.sendMessage(chatId, text, options);
    } catch (err) {
        console.error(`Ошибка отправки сообщения ${chatId}: ${err.message}`);
        if (chatId == adminId) {
            console.log(`Неотправленное сообщение для ${chatId}: ${text}`);
        }
    }
}

// Функция для получения последних отзывов
function getLastFeedbacks(count) {
    try {
        if (!fs.existsSync(feedbackFile)) return 'Нет данных';

        const content = fs.readFileSync(feedbackFile, 'utf-8');
        const feedbacks = content.split('\n').filter(f => f.trim());

        return feedbacks.slice(-count).map(f => {
            try {
                const entry = JSON.parse(f);
                return `${entry.date}\nОт: ${entry.user.first_name} ${entry.user.last_name} (@${entry.user.username})\nID: ${entry.user.id}\n${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}\n${entry.media ? `Медиа: ${entry.media.type}` : ''}`;
            } catch (e) {
                return 'Не удалось прочитать отзыв';
            }
        }).join('\n\n----------\n');
    } catch (e) {
        return 'Ошибка чтения файла';
    }
}

console.log('🤖 Бот MirageML запущен...');
sendSafeMessage(adminId, '🤖 Бот MirageML успешно запущен!');    