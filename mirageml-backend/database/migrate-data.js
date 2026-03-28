const fs = require('fs');
const path = require('path');
const db = require('./db');
require('dotenv').config();

async function migrateData() {
    console.log('Начало миграции данных из JSON в PostgreSQL...\n');

    const DATA_DIR = path.join(__dirname, '../data');

    const usersFile = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile));
        let migrated = 0;

        for (const user of users) {
            try {
                const existing = await db.getUserByEmail(user.email);
                if (!existing) {
                    await db.createUser({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        role: user.role,
                        role_display: user.roleDisplay,
                        theme: user.theme,
                        country: user.country,
                        createdAt: user.createdAt
                    });
                    migrated++;
                    console.log(`Пользователь: ${user.email}`);
                } else {
                    console.log(`Пропущен (существует): ${user.email}`);
                }
            } catch (error) {
                console.error(`Ошибка: ${user.email} - ${error.message}`);
            }
        }
        console.log(`Мигрировано: ${migrated}/${users.length}\n`);
    } else {
        console.log('Файл users.json не найден\n');
    }

    const projectsFile = path.join(DATA_DIR, 'projects.json');
    if (fs.existsSync(projectsFile)) {
        const projects = JSON.parse(fs.readFileSync(projectsFile));
        let migrated = 0;

        for (const project of projects) {
            try {
                const existing = await db.getProjectById(project.id);
                if (!existing) {
                    await db.createProject({
                        id: project.id,
                        user_id: project.userId,
                        name: project.name,
                        elements: project.elements,
                        canvas_size: project.canvasSize
                    });
                    migrated++;
                    console.log(`Проект: ${project.name}`);
                } else {
                    console.log(`Пропущен (существует): ${project.name}`);
                }
            } catch (error) {
                console.error(`Ошибка: ${project.name} - ${error.message}`);
            }
        }
        console.log(`Мигрировано: ${migrated}/${projects.length}\n`);
    } else {
        console.log('Файл projects.json не найден\n');
    }

    const reviewsFile = path.join(DATA_DIR, 'reviews.json');
    if (fs.existsSync(reviewsFile)) {
        const reviews = JSON.parse(fs.readFileSync(reviewsFile));
        let migrated = 0;

        for (const review of reviews) {
            try {
                const existing = await db.getReviewById(review.id);
                if (!existing) {
                    await db.createReview({
                        id: review.id,
                        name: review.name,
                        email: review.email,
                        rating: review.rating,
                        comment: review.comment,
                        approved: review.approved
                    });
                    migrated++;
                    console.log(`Отзыв: ${review.name}`);
                } else {
                    console.log(`Пропущен (существует): ${review.name}`);
                }
            } catch (error) {
                console.error(`Ошибка: ${review.name} - ${error.message}`);
            }
        }
        console.log(`Мигрировано: ${migrated}/${reviews.length}\n`);
    } else {
        console.log('Файл reviews.json не найден\n');
    }

    const sessionsFile = path.join(DATA_DIR, 'sessions.json');
    if (fs.existsSync(sessionsFile)) {
        const sessions = JSON.parse(fs.readFileSync(sessionsFile));
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        let migrated = 0;

        for (const session of sessions) {
            try {
                const lastActive = new Date(session.lastActive);
                if (lastActive < oneDayAgo) {
                    console.log(`Пропущена (устарела): ${session.id}`);
                    continue;
                }

                const existing = await db.getSessionByToken(session.token);
                if (!existing) {
                    await db.createSession({
                        id: session.id,
                        user_id: session.userId,
                        token: session.token,
                        device: session.device,
                        ip: session.ip,
                        location: session.location
                    });
                    migrated++;
                    console.log(`Сессия: ${session.id}`);
                } else {
                    console.log(`Пропущена (существует): ${session.id}`);
                }
            } catch (error) {
                console.error(`Ошибка: ${session.id} - ${error.message}`);
            }
        }
        console.log(`Мигрировано: ${migrated}/${sessions.length}\n`);
    } else {
        console.log('Файл sessions.json не найден\n');
    }

    console.log('Миграция завершена!');
    console.log('\n Теперь вы можете удалить JSON файлы:');
    console.log('   - data/users.json');
    console.log('   - data/projects.json');
    console.log('   - data/sessions.json');
    console.log('   - data/reviews.json');
}

migrateData().catch(console.error);
