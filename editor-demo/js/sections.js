// MirageML Editor Demo - Tilda-style Sections Library
// Библиотека секций в стиле Tilda (90+ секций)

const SECTIONS_LIBRARY = [
    // =============================================
    // ОБЛОЖКА (COVER/HERO) - 8 вариантов
    // =============================================
    {
        id: 'cover-1', name: 'Обложка: Классика', category: 'cover', icon: 'fa-star',
        html: `<section class="section hero-classic" style="padding: 120px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 600px; display: flex; align-items: center;"><div style="max-width: 1200px; margin: 0 auto;"><h1 style="font-size: 56px; color: #ffffff; margin-bottom: 24px; font-weight: 700;">Заголовок вашего сайта</h1><p style="font-size: 22px; color: rgba(255,255,255,0.9); margin-bottom: 48px; max-width: 700px; margin: 0 auto;">Подзаголовок, который описывает ваше уникальное предложение</p><div style="display: flex; gap: 16px; justify-content: center;"><button style="padding: 18px 42px; font-size: 18px; background: #ffffff; color: #667eea; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Начать работу</button><button style="padding: 18px 42px; font-size: 18px; background: transparent; color: #ffffff; border: 2px solid #ffffff; border-radius: 10px; cursor: pointer; font-weight: 600;">Узнать больше</button></div></div></section>`,
        css: `.hero-classic { min-height: 600px; }`
    },
    {
        id: 'cover-2', name: 'Обложка: С фото справа', category: 'cover', icon: 'fa-image',
        html: `<section class="section hero-split" style="padding: 0; min-height: 700px;"><div style="display: grid; grid-template-columns: 1fr 1fr; max-width: 1400px; margin: 0 auto; height: 100vh;"><div style="display: flex; flex-direction: column; justify-content: center; padding: 80px 60px; background: #f8fafc;"><h1 style="font-size: 52px; color: #1a202c; margin-bottom: 24px; font-weight: 800;">Создаём будущее вашего бизнеса</h1><p style="font-size: 20px; color: #4a5568; margin-bottom: 40px;">Мы разрабатываем инновационные решения</p><button style="padding: 16px 38px; font-size: 17px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; width: fit-content;">Оставить заявку</button></div><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'); background-size: cover; background-position: center;"></div></div></section>`,
        css: `.hero-split { min-height: 700px; }`
    },
    {
        id: 'cover-3', name: 'Обложка: С видео фоном', category: 'cover', icon: 'fa-video',
        html: `<section class="section hero-video" style="padding: 140px 20px; text-align: center; min-height: 700px; display: flex; align-items: center; position: relative; overflow: hidden;"><video autoplay muted loop style="position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); z-index: 0;"><source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4" type="video/mp4"></video><div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 1;"></div><div style="position: relative; z-index: 2; max-width: 1000px; margin: 0 auto;"><h1 style="font-size: 64px; color: #ffffff; margin-bottom: 24px; font-weight: 800;">Ваш бренд</h1><p style="font-size: 24px; color: rgba(255,255,255,0.9); margin-bottom: 48px;">Создавайте будущее вместе с нами</p></div></section>`,
        css: `.hero-video { min-height: 700px; }`
    },
    {
        id: 'cover-4', name: 'Обложка: Минимализм', category: 'cover', icon: 'fa-minus',
        html: `<section class="section hero-minimal" style="padding: 160px 20px; background: #ffffff; min-height: 650px; display: flex; align-items: center;"><div style="max-width: 1200px; margin: 0 auto; text-align: center;"><h1 style="font-size: 72px; color: #1a202c; margin-bottom: 32px; font-weight: 300;">Простота — высшая форма утончённости</h1><p style="font-size: 19px; color: #64748b; margin-bottom: 56px; max-width: 600px; margin: 0 auto;">Мы создаём элегантные решения для сложных задач</p></div></section>`,
        css: `.hero-minimal { min-height: 650px; }`
    },
    {
        id: 'cover-5', name: 'Обложка: Тёмная', category: 'cover', icon: 'fa-moon',
        html: `<section class="section hero-dark" style="padding: 140px 20px; text-align: center; background: #0f172a; min-height: 650px; display: flex; align-items: center;"><div style="max-width: 1200px; margin: 0 auto;"><h1 style="font-size: 64px; color: #ffffff; margin-bottom: 24px; font-weight: 800;">Инновации начинаются здесь</h1><p style="font-size: 22px; color: #94a3b8; margin-bottom: 48px; max-width: 700px; margin: 0 auto;">Технологии будущего доступны уже сегодня</p><button style="padding: 18px 42px; font-size: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Начать сейчас</button></div></section>`,
        css: `.hero-dark { min-height: 650px; }`
    },
    {
        id: 'cover-6', name: 'Обложка: С градиентом', category: 'cover', icon: 'fa-palette',
        html: `<section class="section hero-gradient" style="padding: 140px 20px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); min-height: 650px; display: flex; align-items: center;"><div style="max-width: 1200px; margin: 0 auto;"><h1 style="font-size: 56px; color: #ffffff; margin-bottom: 24px; font-weight: 700;">Воплощаем мечты в реальность</h1><p style="font-size: 22px; color: rgba(255,255,255,0.95); margin-bottom: 48px; max-width: 700px; margin: 0 auto;">Креативные решения для вашего бизнеса</p></div></section>`,
        css: `.hero-gradient { min-height: 650px; }`
    },
    {
        id: 'cover-7', name: 'Обложка: С формой', category: 'cover', icon: 'fa-form',
        html: `<section class="section hero-form" style="padding: 120px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 700px; display: flex; align-items: center;"><div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;"><div><h1 style="font-size: 52px; color: #ffffff; margin-bottom: 24px; font-weight: 700;">Начните свой путь к успеху</h1><p style="font-size: 20px; color: rgba(255,255,255,0.9); margin-bottom: 32px;">Оставьте заявку и мы свяжемся с вами в течение 15 минут</p></div><div style="background: white; padding: 40px; border-radius: 20px;"><input type="text" placeholder="Ваше имя" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 16px;"><input type="email" placeholder="Email" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 24px;"><button style="width: 100%; padding: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Отправить заявку</button></div></div></section>`,
        css: `.hero-form { min-height: 700px; }`
    },
    {
        id: 'cover-8', name: 'Обложка: С логотипом', category: 'cover', icon: 'fa-badge',
        html: `<section class="section hero-logo" style="padding: 140px 20px; text-align: center; background: #ffffff; min-height: 650px; display: flex; align-items: center;"><div style="max-width: 1200px; margin: 0 auto;"><div style="width: 100px; height: 100px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px;"><i class="fas fa-rocket" style="font-size: 48px; color: white;"></i></div><h1 style="font-size: 56px; color: #1a202c; margin-bottom: 24px; font-weight: 700;">Ваш стартап</h1><p style="font-size: 22px; color: #64748b; margin-bottom: 48px; max-width: 600px; margin: 0 auto;">Инновационные решения для современного бизнеса</p></div></section>`,
        css: `.hero-logo { min-height: 650px; }`
    },

    // =============================================
    // О ПРОЕКТЕ (ABOUT) - 6 вариантов
    // =============================================
    {
        id: 'about-1', name: 'О проекте: Классика', category: 'about', icon: 'fa-building',
        html: `<section class="section about-classic" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><div style="text-align: center; margin-bottom: 64px;"><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 24px; font-weight: 700;">О нашей компании</h2><p style="font-size: 18px; color: #4a5568; max-width: 700px; margin: 0 auto;">За это время мы реализовали более 500 проектов</p></div><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;"><div style="text-align: center; padding: 32px; background: white; border-radius: 16px;"><div style="font-size: 56px; font-weight: 800; color: #6366f1;">10+</div><div style="color: #64748b;">Лет опыта</div></div><div style="text-align: center; padding: 32px; background: white; border-radius: 16px;"><div style="font-size: 56px; font-weight: 800; color: #10b981;">500+</div><div style="color: #64748b;">Проектов</div></div><div style="text-align: center; padding: 32px; background: white; border-radius: 16px;"><div style="font-size: 56px; font-weight: 800; color: #f59e0b;">50+</div><div style="color: #64748b;">Сотрудников</div></div><div style="text-align: center; padding: 32px; background: white; border-radius: 16px;"><div style="font-size: 56px; font-weight: 800; color: #ef4444;">99%</div><div style="color: #64748b;">Довольных</div></div></div></div></section>`,
        css: `.about-classic { min-height: 500px; }`
    },
    {
        id: 'about-2', name: 'О проекте: С фото', category: 'about', icon: 'fa-image',
        html: `<section class="section about-photo" style="padding: 100px 20px;"><div style="max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;"><div style="position: relative;"><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 24px; height: 600px; background-image: url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'); background-size: cover; background-position: center;"></div></div><div><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 32px; font-weight: 700;">Команда профессионалов</h2><p style="font-size: 18px; color: #4a5568; margin-bottom: 32px; line-height: 1.8;">Мы верим, что качественный дизайн может изменить бизнес к лучшему.</p><button style="padding: 16px 38px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Подробнее</button></div></div></section>`,
        css: `.about-photo { min-height: 700px; }`
    },
    {
        id: 'about-3', name: 'О проекте: История', category: 'about', icon: 'fa-timeline',
        html: `<section class="section about-timeline" style="padding: 100px 20px; background: #1a202c;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #ffffff; margin-bottom: 80px; font-weight: 700;">Наш путь</h2><div style="display: flex; flex-direction: column; gap: 40px;"><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;"><div style="text-align: right; padding-right: 40px;"><h3 style="font-size: 28px; color: #ffffff; margin-bottom: 12px;">2015 — Основание</h3><p style="color: #9ca3af;">Трое энтузиастов собрались с мечтой изменить мир дизайна</p></div><div style="width: 20px; height: 20px; background: #6366f1; border-radius: 50%;"></div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;"><div style="width: 20px; height: 20px; background: #8b5cf6; border-radius: 50%;"></div><div style="padding-left: 40px;"><h3 style="font-size: 28px; color: #ffffff; margin-bottom: 12px;">2018 — Прорыв</h3><p style="color: #9ca3af;">Первый крупный контракт с международной корпорацией</p></div></div></div></div></section>`,
        css: `.about-timeline { min-height: 600px; }`
    },
    {
        id: 'about-4', name: 'О проекте: Миссия', category: 'about', icon: 'fa-bullseye',
        html: `<section class="section about-mission" style="padding: 100px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"><div style="max-width: 1200px; margin: 0 auto; text-align: center;"><div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 32px;"><i class="fas fa-bullseye" style="font-size: 40px; color: white;"></i></div><h2 style="font-size: 48px; color: #ffffff; margin-bottom: 24px; font-weight: 700;">Наша миссия</h2><p style="font-size: 24px; color: rgba(255,255,255,0.95); max-width: 800px; margin: 0 auto;">Делать качественный дизайн доступным для каждого бизнеса</p></div></section>`,
        css: `.about-mission { min-height: 600px; }`
    },
    {
        id: 'about-5', name: 'О проекте: Текст', category: 'about', icon: 'fa-text',
        html: `<section class="section about-text" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 900px; margin: 0 auto;"><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 32px; font-weight: 700;">О нашем подходе</h2><p style="font-size: 18px; color: #4a5568; line-height: 1.8; margin-bottom: 24px;">Мы работаем на рынке уже более 10 лет и за это время реализовали более 500 проектов для клиентов по всему миру.</p><p style="font-size: 18px; color: #4a5568; line-height: 1.8;">Наша команда состоит из профессионалов своего дела, которые постоянно совершенствуют свои навыки и следят за последними тенденциями в дизайне и разработке.</p></div></section>`,
        css: `.about-text { min-height: 400px; }`
    },
    {
        id: 'about-6', name: 'О проекте: Преимущества', category: 'about', icon: 'fa-check',
        html: `<section class="section about-features" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Почему выбирают нас</h2><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px;"><div style="display: flex; gap: 20px;"><div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fas fa-rocket" style="font-size: 24px; color: white;"></i></div><div><h3 style="font-size: 22px; color: #1a202c; margin-bottom: 12px;">Быстро</h3><p style="color: #64748b; line-height: 1.6;">Молниеносная скорость работы и соблюдение всех сроков</p></div></div><div style="display: flex; gap: 20px;"><div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fas fa-shield-alt" style="font-size: 24px; color: white;"></i></div><div><h3 style="font-size: 22px; color: #1a202c; margin-bottom: 12px;">Надёжно</h3><p style="color: #64748b; line-height: 1.6;">Гарантия качества и защита ваших данных</p></div></div></div></div></section>`,
        css: `.about-features { min-height: 500px; }`
    },

    // =============================================
    // ЗАГОЛОВОК (HEADER) - 4 варианта
    // =============================================
    {
        id: 'header-1', name: 'Заголовок: По центру', category: 'header', icon: 'fa-heading',
        html: `<section class="section header-center" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 900px; margin: 0 auto; text-align: center;"><h2 style="font-size: 48px; color: #1a202c; margin-bottom: 24px; font-weight: 700;">Заголовок раздела</h2><p style="font-size: 20px; color: #64748b; max-width: 600px; margin: 0 auto;">Подзаголовок, который раскрывает суть раздела</p></div></section>`,
        css: `.header-center { min-height: 200px; }`
    },
    {
        id: 'header-2', name: 'Заголовок: Слева', category: 'header', icon: 'fa-align-left',
        html: `<section class="section header-left" style="padding: 80px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><div style="max-width: 700px;"><div style="width: 60px; height: 4px; background: linear-gradient(135deg, #6366f1, #8b5cf6); margin-bottom: 24px;"></div><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 20px; font-weight: 700;">Заголовок раздела</h2><p style="font-size: 18px; color: #64748b;">Краткое описание содержимого</p></div></div></section>`,
        css: `.header-left { min-height: 200px; }`
    },
    {
        id: 'header-3', name: 'Заголовок: С кнопкой', category: 'header', icon: 'fa-button',
        html: `<section class="section header-action" style="padding: 80px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;"><div><h2 style="font-size: 42px; color: #ffffff; margin-bottom: 16px; font-weight: 700;">Готовы начать?</h2><p style="font-size: 18px; color: rgba(255,255,255,0.9);">Оставьте заявку</p></div><button style="padding: 16px 32px; background: white; color: #667eea; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Оставить заявку</button></div></section>`,
        css: `.header-action { min-height: 200px; }`
    },
    {
        id: 'header-4', name: 'Заголовок: С иконкой', category: 'header', icon: 'fa-icons',
        html: `<section class="section header-icon" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 900px; margin: 0 auto; text-align: center;"><div style="width: 70px; height: 70px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;"><i class="fas fa-star" style="font-size: 32px; color: white;"></i></div><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 20px; font-weight: 700;">Наши преимущества</h2></div></section>`,
        css: `.header-icon { min-height: 200px; }`
    },

    // =============================================
    // ТЕКСТОВЫЙ БЛОК (TEXT) - 4 варианта
    // =============================================
    {
        id: 'text-1', name: 'Текст: Классический', category: 'text', icon: 'fa-paragraph',
        html: `<section class="section text-classic" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 800px; margin: 0 auto;"><p style="font-size: 18px; color: #4a5568; line-height: 1.8; margin-bottom: 24px;">Это пример текстового блока. Здесь вы можете разместить описание вашего продукта или услуги.</p><p style="font-size: 18px; color: #4a5568; line-height: 1.8;">Добавляйте несколько абзацев для подробного описания.</p></div></section>`,
        css: `.text-classic { min-height: 200px; }`
    },
    {
        id: 'text-2', name: 'Текст: С цитатой', category: 'text', icon: 'fa-quote-right',
        html: `<section class="section text-quote" style="padding: 80px 20px; background: #f8fafc;"><div style="max-width: 900px; margin: 0 auto;"><p style="font-size: 18px; color: #4a5568; line-height: 1.8; margin-bottom: 40px;">Текст вступления, который подводит читателя к основной мысли.</p><div style="border-left: 4px solid #6366f1; padding-left: 32px; margin: 40px 0;"><p style="font-size: 24px; color: #1a202c; font-style: italic; margin-bottom: 16px;">«Качественный дизайн — это то, что хорошо работает»</p></div></div></section>`,
        css: `.text-quote { min-height: 250px; }`
    },
    {
        id: 'text-3', name: 'Текст: Две колонки', category: 'text', icon: 'fa-columns',
        html: `<section class="section text-columns" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px;"><div><h3 style="font-size: 24px; color: #1a202c; margin-bottom: 20px; font-weight: 600;">Первая колонка</h3><p style="font-size: 16px; color: #4a5568; line-height: 1.8;">Текст первой колонки с описанием характеристик или преимуществ.</p></div><div><h3 style="font-size: 24px; color: #1a202c; margin-bottom: 20px; font-weight: 600;">Вторая колонка</h3><p style="font-size: 16px; color: #4a5568; line-height: 1.8;">Текст второй колонки с дополнительной информацией.</p></div></div></section>`,
        css: `.text-columns { min-height: 300px; }`
    },
    {
        id: 'text-4', name: 'Текст: С акцентом', category: 'text', icon: 'fa-highlighter',
        html: `<section class="section text-accent" style="padding: 80px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"><div style="max-width: 900px; margin: 0 auto; text-align: center;"><p style="font-size: 28px; color: #ffffff; line-height: 1.6; font-weight: 300;">Крупный текст для важного сообщения. Подходит для ключевых утверждений.</p></div></section>`,
        css: `.text-accent { min-height: 250px; }`
    },

    // =============================================
    // ИЗОБРАЖЕНИЕ (IMAGE) - 6 вариантов
    // =============================================
    {
        id: 'image-1', name: 'Изображение: Одно', category: 'image', icon: 'fa-image',
        html: `<section class="section image-single" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200" alt="Image" style="width: 100%; height: 600px; object-fit: cover; border-radius: 20px;"></div></section>`,
        css: `.image-single { min-height: 600px; }`
    },
    {
        id: 'image-2', name: 'Изображение: С описанием', category: 'image', icon: 'fa-image',
        html: `<section class="section image-caption" style="padding: 80px 20px;"><div style="max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;"><div><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" alt="Team" style="width: 100%; height: 500px; object-fit: cover; border-radius: 20px;"></div><div><h3 style="font-size: 32px; color: #1a202c; margin-bottom: 20px; font-weight: 700;">Заголовок изображения</h3><p style="font-size: 18px; color: #4a5568; line-height: 1.7;">Подробное описание того, что изображено на фотографии.</p></div></div></section>`,
        css: `.image-caption { min-height: 500px; }`
    },
    {
        id: 'image-3', name: 'Изображение: Коллаж 3', category: 'image', icon: 'fa-th',
        html: `<section class="section image-collage" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;"><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400" alt="1" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400" alt="2" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400" alt="3" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"></div></section>`,
        css: `.image-collage { min-height: 350px; }`
    },
    {
        id: 'image-4', name: 'Изображение: На всю ширину', category: 'image', icon: 'fa-arrows-alt-h',
        html: `<section class="section image-fullwidth" style="padding: 0; background: #ffffff;"><img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920" alt="Full width" style="width: 100%; height: 700px; object-fit: cover; display: block;"></section>`,
        css: `.image-fullwidth { min-height: 700px; }`
    },
    {
        id: 'image-5', name: 'Изображение: 2 в ряд', category: 'image', icon: 'fa-images',
        html: `<section class="section image-double" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" alt="1" style="width: 100%; height: 400px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600" alt="2" style="width: 100%; height: 400px; object-fit: cover; border-radius: 12px;"></div></section>`,
        css: `.image-double { min-height: 450px; }`
    },
    {
        id: 'image-6', name: 'Изображение: С рамкой', category: 'image', icon: 'fa-frame',
        html: `<section class="section image-frame" style="padding: 80px 20px; background: #f8fafc;"><div style="max-width: 1000px; margin: 0 auto;"><img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000" alt="Framed" style="width: 100%; height: 600px; object-fit: cover; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);"></div></section>`,
        css: `.image-frame { min-height: 650px; }`
    },

    // =============================================
    // ГАЛЕРЕЯ (GALLERY) - 4 варианта
    // =============================================
    {
        id: 'gallery-1', name: 'Галерея: Сетка 3x2', category: 'gallery', icon: 'fa-images',
        html: `<section class="section gallery-grid" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 36px; color: #1a202c; margin-bottom: 60px; font-weight: 700;">Наши работы</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" alt="1" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=400" alt="2" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400" alt="3" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400" alt="4" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400" alt="5" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400" alt="6" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px;"></div></div></section>`,
        css: `.gallery-grid { min-height: 700px; }`
    },
    {
        id: 'gallery-2', name: 'Галерея: Masonry', category: 'gallery', icon: 'fa-th-large',
        html: `<section class="section gallery-masonry" style="padding: 80px 20px;"><div style="max-width: 1200px; margin: 0 auto; column-count: 3; column-gap: 20px;"><img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400" alt="1" style="width: 100%; margin-bottom: 20px; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" alt="2" style="width: 100%; margin-bottom: 20px; border-radius: 12px;"><img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400" alt="3" style="width: 100%; margin-bottom: 20px; border-radius: 12px;"></div></section>`,
        css: `.gallery-masonry { min-height: 800px; }`
    },
    {
        id: 'gallery-3', name: 'Галерея: С подписями', category: 'gallery', icon: 'fa-image',
        html: `<section class="section gallery-captions" style="padding: 80px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 36px; color: #1a202c; margin-bottom: 60px; font-weight: 700;">Портфолио</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;"><div style="border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400" alt="1" style="width: 100%; height: 280px; object-fit: cover;"><div style="padding: 20px; background: white;"><h4 style="font-size: 18px; color: #1a202c; margin-bottom: 8px;">Проект 1</h4></div></div></div></div></section>`,
        css: `.gallery-captions { min-height: 600px; }`
    },
    {
        id: 'gallery-4', name: 'Галерея: Слайдер', category: 'gallery', icon: 'fa-sliders-h',
        html: `<section class="section gallery-slider" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 36px; color: #1a202c; margin-bottom: 60px; font-weight: 700;">Избранные работы</h2><div style="display: flex; gap: 20px; overflow-x: auto;"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600" alt="1" style="min-width: 400px; height: 300px; object-fit: cover; border-radius: 16px;"><img src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600" alt="2" style="min-width: 400px; height: 300px; object-fit: cover; border-radius: 16px;"></div></div></section>`,
        css: `.gallery-slider { min-height: 500px; }`
    },

    // =============================================
    // ПРЕИМУЩЕСТВА (FEATURES) - 6 вариантов
    // =============================================
    {
        id: 'features-1', name: 'Преимущества: 3 карточки', category: 'features', icon: 'fa-th-large',
        html: `<section class="section features-cards" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Наши преимущества</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;"><div style="background: white; padding: 40px 32px; border-radius: 20px; text-align: center;"><div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;"><i class="fas fa-rocket" style="font-size: 32px; color: white;"></i></div><h3 style="font-size: 22px; color: #1a202c; margin-bottom: 12px; font-weight: 600;">Быстро</h3><p style="color: #64748b; line-height: 1.7;">Молниеносная скорость работы</p></div><div style="background: white; padding: 40px 32px; border-radius: 20px; text-align: center;"><div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;"><i class="fas fa-shield-alt" style="font-size: 32px; color: white;"></i></div><h3 style="font-size: 22px; color: #1a202c; margin-bottom: 12px; font-weight: 600;">Надёжно</h3><p style="color: #64748b; line-height: 1.7;">Гарантия качества</p></div><div style="background: white; padding: 40px 32px; border-radius: 20px; text-align: center;"><div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;"><i class="fas fa-gem" style="font-size: 32px; color: white;"></i></div><h3 style="font-size: 22px; color: #1a202c; margin-bottom: 12px; font-weight: 600;">Качественно</h3><p style="color: #64748b; line-height: 1.7;">Премиальное качество</p></div></div></div></section>`,
        css: `.features-cards { min-height: 500px; }`
    },
    {
        id: 'features-2', name: 'Преимущества: Список', category: 'features', icon: 'fa-list',
        html: `<section class="section features-list" style="padding: 100px 20px;"><div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;"><div><img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600" alt="Features" style="width: 100%; border-radius: 20px;"></div><div><h2 style="font-size: 36px; color: #1a202c; margin-bottom: 32px; font-weight: 700;">Почему выбирают нас</h2><div style="display: flex; flex-direction: column; gap: 24px;"><div style="display: flex; gap: 20px; align-items: flex-start;"><div style="width: 56px; height: 56px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fas fa-check" style="font-size: 22px; color: white;"></i></div><div><h4 style="font-size: 20px; color: #1a202c; margin-bottom: 8px; font-weight: 600;">Профессиональная команда</h4><p style="color: #64748b; line-height: 1.6;">Опытные специалисты</p></div></div></div></div></div></section>`,
        css: `.features-list { min-height: 600px; }`
    },
    {
        id: 'features-3', name: 'Преимущества: Цифры', category: 'features', icon: 'fa-chart-line',
        html: `<section class="section features-stats" style="padding: 100px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"><div style="max-width: 1200px; margin: 0 auto;"><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; text-align: center;"><div><div style="font-size: 72px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">500+</div><div style="font-size: 18px; color: rgba(255,255,255,0.9);">Проектов</div></div><div><div style="font-size: 72px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">50+</div><div style="font-size: 18px; color: rgba(255,255,255,0.9);">Клиентов</div></div></div></div></section>`,
        css: `.features-stats { min-height: 400px; }`
    },
    {
        id: 'features-4', name: 'Преимущества: Иконки', category: 'features', icon: 'fa-icons',
        html: `<section class="section features-icons" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Что мы предлагаем</h2><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;"><div style="text-align: center;"><div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;"><i class="fas fa-palette" style="font-size: 32px; color: white;"></i></div><h3 style="font-size: 20px; color: #1a202c; margin-bottom: 12px;">Дизайн</h3></div><div style="text-align: center;"><div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;"><i class="fas fa-code" style="font-size: 32px; color: white;"></i></div><h3 style="font-size: 20px; color: #1a202c; margin-bottom: 12px;">Разработка</h3></div></div></div></section>`,
        css: `.features-icons { min-height: 500px; }`
    },
    {
        id: 'features-5', name: 'Преимущества: Шахматы', category: 'features', icon: 'fa-chess',
        html: `<section class="section features-checker" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Наши преимущества</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;"><div style="background: white; padding: 40px; border-radius: 20px;"><h3 style="font-size: 24px; color: #1a202c; margin-bottom: 16px;">Качество</h3><p style="color: #64748b; line-height: 1.7;">Гарантия высокого качества всех наших услуг</p></div><div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; border-radius: 20px;"><h3 style="font-size: 24px; color: #ffffff; margin-bottom: 16px;">Скорость</h3><p style="color: rgba(255,255,255,0.9); line-height: 1.7;">Молниеносное выполнение всех задач</p></div></div></div></section>`,
        css: `.features-checker { min-height: 500px; }`
    },
    {
        id: 'features-6', name: 'Преимущества: Горизонталь', category: 'features', icon: 'fa-arrows-alt-h',
        html: `<section class="section features-horizontal" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Преимущества</h2><div style="display: flex; gap: 40px; justify-content: center; flex-wrap: wrap;"><div style="text-align: center; max-width: 250px;"><div style="width: 60px; height: 60px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;"><i class="fas fa-rocket" style="font-size: 24px; color: white;"></i></div><h3 style="font-size: 20px; color: #1a202c; margin-bottom: 12px;">Быстро</h3></div><div style="text-align: center; max-width: 250px;"><div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;"><i class="fas fa-shield-alt" style="font-size: 24px; color: white;"></i></div><h3 style="font-size: 20px; color: #1a202c; margin-bottom: 12px;">Надёжно</h3></div></div></div></section>`,
        css: `.features-horizontal { min-height: 400px; }`
    },

    // =============================================
    // КОМАНДА (TEAM) - 4 варианта
    // =============================================
    {
        id: 'team-1', name: 'Команда: Сетка 4', category: 'team', icon: 'fa-users',
        html: `<section class="section team-grid" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Наша команда</h2><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;"><div style="text-align: center;"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300" alt="Member 1" style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin-bottom: 20px;"><h4 style="font-size: 20px; color: #1a202c; margin-bottom: 8px; font-weight: 600;">Александр Петров</h4><p style="color: #6366f1; font-weight: 500;">CEO & Founder</p></div></div></div></section>`,
        css: `.team-grid { min-height: 600px; }`
    },
    {
        id: 'team-2', name: 'Команда: Карточки', category: 'team', icon: 'fa-id-card',
        html: `<section class="section team-cards" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Команда экспертов</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;"><div style="background: white; border-radius: 20px; overflow: hidden;"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400" alt="Member 1" style="width: 100%; height: 320px; object-fit: cover;"><div style="padding: 28px;"><h4 style="font-size: 22px; color: #1a202c; margin-bottom: 8px; font-weight: 600;">Александр Петров</h4><p style="color: #6366f1; margin-bottom: 16px;">CEO & Founder</p></div></div></div></div></section>`,
        css: `.team-cards { min-height: 700px; }`
    },
    {
        id: 'team-3', name: 'Команда: Горизонтальная', category: 'team', icon: 'fa-user-friends',
        html: `<section class="section team-horizontal" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Руководство</h2><div style="display: grid; grid-template-columns: 300px 1fr; gap: 40px; align-items: center; background: #f8fafc; padding: 40px; border-radius: 24px;"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400" alt="CEO" style="width: 100%; height: 350px; object-fit: cover; border-radius: 16px;"><div><h3 style="font-size: 32px; color: #1a202c; margin-bottom: 8px;">Александр Петров</h3><p style="color: #6366f1; font-size: 18px; margin-bottom: 24px;">Генеральный директор</p></div></div></div></section>`,
        css: `.team-horizontal { min-height: 500px; }`
    },
    {
        id: 'team-4', name: 'Команда: Минимализм', category: 'team', icon: 'fa-users',
        html: `<section class="section team-minimal" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Наша команда</h2><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;"><div style="text-align: center;"><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300" alt="Member" style="width: 160px; height: 160px; border-radius: 50%; object-fit: cover; margin-bottom: 16px;"><h4 style="font-size: 18px; color: #1a202c; margin-bottom: 4px;">Александр П.</h4><p style="color: #64748b; font-size: 14px;">CEO</p></div></div></div></section>`,
        css: `.team-minimal { min-height: 500px; }`
    },

    // =============================================
    // ОТЗЫВЫ (TESTIMONIALS) - 4 варианта
    // =============================================
    {
        id: 'testimonials-1', name: 'Отзывы: 3 карточки', category: 'testimonials', icon: 'fa-comments',
        html: `<section class="section testimonials-cards" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Отзывы клиентов</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;"><div style="background: white; padding: 40px; border-radius: 20px;"><p style="color: #4a5568; line-height: 1.7; margin-bottom: 24px; font-style: italic;">"Отличная команда! Сделали всё в срок!"</p><div style="font-weight: 600; color: #1a202c;">Алексей Иванов</div><div style="font-size: 13px; color: #6366f1;">CEO, TechCorp</div></div></div></div></section>`,
        css: `.testimonials-cards { min-height: 550px; }`
    },
    {
        id: 'testimonials-2', name: 'Отзывы: Цитата', category: 'testimonials', icon: 'fa-quote-left',
        html: `<section class="section testimonials-quote" style="padding: 120px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"><div style="max-width: 900px; margin: 0 auto; text-align: center;"><i class="fas fa-quote-left" style="font-size: 48px; color: rgba(255,255,255,0.3); margin-bottom: 32px;"></i><p style="font-size: 32px; color: #ffffff; line-height: 1.6; margin-bottom: 40px;">«Работа с MirageML превзошла все ожидания»</p></div></section>`,
        css: `.testimonials-quote { min-height: 450px; }`
    },
    {
        id: 'testimonials-3', name: 'Отзывы: Логотипы', category: 'testimonials', icon: 'fa-building',
        html: `<section class="section testimonials-logos" style="padding: 80px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 36px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Нам доверяют</h2><div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 48px;"><div style="width: 140px; height: 60px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">LOGO</div></div></div></section>`,
        css: `.testimonials-logos { min-height: 300px; }`
    },
    {
        id: 'testimonials-4', name: 'Отзывы: С фото', category: 'testimonials', icon: 'fa-user',
        html: `<section class="section testimonials-photo" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Отзывы клиентов</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;"><div style="display: flex; gap: 20px;"><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" alt="Client" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;"><div><p style="color: #4a5568; line-height: 1.7; margin-bottom: 16px; font-style: italic;">"Отличная команда!"</p><div style="font-weight: 600; color: #1a202c;">Алексей Иванов</div></div></div></div></div></section>`,
        css: `.testimonials-photo { min-height: 450px; }`
    },

    // =============================================
    // КОНТАКТЫ (CONTACT) - 4 варианта
    // =============================================
    {
        id: 'contact-1', name: 'Контакты: С формой', category: 'contact', icon: 'fa-envelope',
        html: `<section class="section contact-form" style="padding: 100px 20px;"><div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px;"><div><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 24px; font-weight: 700;">Свяжитесь с нами</h2><p style="color: #64748b; margin-bottom: 40px; font-size: 18px;">Оставьте заявку</p></div><div style="background: white; padding: 48px; border-radius: 24px;"><form><input type="text" placeholder="Имя" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;"><input type="email" placeholder="Email" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;"><button style="width: 100%; padding: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Отправить</button></form></div></div></section>`,
        css: `.contact-form { min-height: 700px; }`
    },
    {
        id: 'contact-2', name: 'Контакты: Соцсети', category: 'contact', icon: 'fa-share-alt',
        html: `<section class="section contact-social" style="padding: 100px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"><div style="max-width: 900px; margin: 0 auto; text-align: center;"><h2 style="font-size: 42px; color: #ffffff; margin-bottom: 48px; font-weight: 700;">Подписывайтесь на нас</h2><div style="display: flex; justify-content: center; gap: 20px;"><a href="#" style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px;"><i class="fab fa-telegram"></i></a><a href="#" style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px;"><i class="fab fa-vk"></i></a></div></div></section>`,
        css: `.contact-social { min-height: 400px; }`
    },
    {
        id: 'contact-3', name: 'Контакты: Карта', category: 'contact', icon: 'fa-map',
        html: `<section class="section contact-map" style="padding: 0; min-height: 600px;"><div style="display: grid; grid-template-columns: 1fr 1fr; height: 600px;"><div style="padding: 80px 60px; background: #f8fafc;"><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 24px;">Наши офисы</h2><p style="color: #64748b; line-height: 1.7;">Москва, ул. Примерная, 10</p></div><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div></div></section>`,
        css: `.contact-map { min-height: 600px; }`
    },
    {
        id: 'contact-4', name: 'Контакты: Минимализм', category: 'contact', icon: 'fa-address-card',
        html: `<section class="section contact-minimal" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 800px; margin: 0 auto; text-align: center;"><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Контакты</h2><a href="tel:+79991234567" style="font-size: 24px; color: #1a202c; text-decoration: none; font-weight: 600; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; display: block; margin-bottom: 16px;">+7 (999) 123-45-67</a></div></section>`,
        css: `.contact-minimal { min-height: 500px; }`
    },

    // =============================================
    // ФОРМА (FORM) - 4 варианта
    // =============================================
    {
        id: 'form-1', name: 'Форма: Заявка', category: 'form', icon: 'fa-file-alt',
        html: `<section class="section form-lead" style="padding: 100px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"><div style="max-width: 600px; margin: 0 auto; background: white; padding: 48px; border-radius: 24px;"><h2 style="font-size: 32px; color: #1a202c; margin-bottom: 24px; text-align: center;">Оставить заявку</h2><form><input type="text" placeholder="Имя" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;"><input type="email" placeholder="Email" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;"><button style="width: 100%; padding: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Отправить</button></form></div></section>`,
        css: `.form-lead { min-height: 600px; }`
    },
    {
        id: 'form-2', name: 'Форма: Подписка', category: 'form', icon: 'fa-envelope-open',
        html: `<section class="section form-subscribe" style="padding: 80px 20px; background: #ffffff;"><div style="max-width: 600px; margin: 0 auto; text-align: center;"><h2 style="font-size: 32px; color: #1a202c; margin-bottom: 16px;">Подписаться на рассылку</h2><p style="color: #64748b; margin-bottom: 32px;">Получайте полезные материалы на почту</p><form style="display: flex; gap: 12px;"><input type="email" placeholder="Email" style="flex: 1; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px;"><button style="padding: 16px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Подписаться</button></form></div></section>`,
        css: `.form-subscribe { min-height: 350px; }`
    },
    {
        id: 'form-3', name: 'Форма: Обратный звонок', category: 'form', icon: 'fa-phone-alt',
        html: `<section class="section form-callback" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 20px;"><h2 style="font-size: 28px; color: #1a202c; margin-bottom: 24px;">Заказать звонок</h2><form><input type="text" placeholder="Имя" style="width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;"><input type="tel" placeholder="Телефон" style="width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;"><button style="width: 100%; padding: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Перезвоните мне</button></form></div></section>`,
        css: `.form-callback { min-height: 500px; }`
    },
    {
        id: 'form-4', name: 'Форма: Регистрация', category: 'form', icon: 'fa-user-plus',
        html: `<section class="section form-register" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 500px; margin: 0 auto; background: white; padding: 48px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.1);"><h2 style="font-size: 32px; color: #1a202c; margin-bottom: 32px; text-align: center;">Регистрация</h2><form><input type="text" placeholder="Имя" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;"><input type="email" placeholder="Email" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px;"><input type="password" placeholder="Пароль" style="width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;"><button style="width: 100%; padding: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Создать аккаунт</button></form></div></section>`,
        css: `.form-register { min-height: 600px; }`
    },

    // =============================================
    // КНОПКА (BUTTON) - 4 варианта
    // =============================================
    {
        id: 'button-1', name: 'Кнопка: CTA', category: 'button', icon: 'fa-hand-pointer',
        html: `<section class="section button-cta" style="padding: 100px 20px; background: #ffffff; text-align: center;"><div style="max-width: 800px; margin: 0 auto;"><h2 style="font-size: 36px; color: #1a202c; margin-bottom: 32px;">Готовы начать?</h2><button style="padding: 20px 48px; font-size: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Начать бесплатно</button></div></section>`,
        css: `.button-cta { min-height: 300px; }`
    },
    {
        id: 'button-2', name: 'Кнопка: Соцсети', category: 'button', icon: 'fa-share-alt',
        html: `<section class="section button-social" style="padding: 80px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); text-align: center;"><div style="max-width: 800px; margin: 0 auto; display: flex; gap: 16px; justify-content: center;"><a href="#" style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;"><i class="fab fa-telegram"></i></a><a href="#" style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;"><i class="fab fa-vk"></i></a></div></section>`,
        css: `.button-social { min-height: 250px; }`
    },
    {
        id: 'button-3', name: 'Кнопка: Группа', category: 'button', icon: 'fa-th',
        html: `<section class="section button-group" style="padding: 80px 20px; background: #f8fafc; text-align: center;"><div style="max-width: 800px; margin: 0 auto; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;"><button style="padding: 16px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Основная</button><button style="padding: 16px 32px; background: white; color: #6366f1; border: 2px solid #6366f1; border-radius: 10px; cursor: pointer; font-weight: 600;">Вторичная</button></div></section>`,
        css: `.button-group { min-height: 250px; }`
    },
    {
        id: 'button-4', name: 'Кнопка: Ссылки', category: 'button', icon: 'fa-link',
        html: `<section class="section button-links" style="padding: 80px 20px; background: #ffffff; text-align: center;"><div style="max-width: 800px; margin: 0 auto; display: flex; gap: 24px; justify-content: center;"><a href="#" style="color: #6366f1; text-decoration: none; font-weight: 600; padding: 12px 24px; border: 2px solid #6366f1; border-radius: 10px;">Узнать больше</a></div></section>`,
        css: `.button-links { min-height: 200px; }`
    },

    // =============================================
    // ПОДВАЛ (FOOTER) - 4 варианта
    // =============================================
    {
        id: 'footer-1', name: 'Подвал: Классический', category: 'footer', icon: 'fa-window-minimize',
        html: `<footer class="section footer-classic" style="padding: 60px 20px; background: #1a202c;"><div style="max-width: 1200px; margin: 0 auto;"><p style="color: #9ca3af; text-align: center;">&copy; 2024 Ваша компания. Все права защищены.</p></div></footer>`,
        css: `.footer-classic { min-height: 200px; }`
    },
    {
        id: 'footer-2', name: 'Подвал: Минимализм', category: 'footer', icon: 'fa-minus',
        html: `<footer class="section footer-minimal" style="padding: 40px 20px; background: #ffffff; border-top: 1px solid #e2e8f0;"><div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;"><p style="color: #64748b;">&copy; 2024 MirageML</p></div></footer>`,
        css: `.footer-minimal { min-height: 150px; }`
    },
    {
        id: 'footer-3', name: 'Подвал: С ссылками', category: 'footer', icon: 'fa-link',
        html: `<footer class="section footer-links" style="padding: 80px 20px 40px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; margin-bottom: 60px;"><div><h4 style="color: #1a202c; font-size: 18px; margin-bottom: 20px;">Компания</h4><ul style="list-style: none; padding: 0;"><li style="margin-bottom: 12px;"><a href="#" style="color: #64748b; text-decoration: none;">О нас</a></li></ul></div></div></div></footer>`,
        css: `.footer-links { min-height: 350px; }`
    },
    {
        id: 'footer-4', name: 'Подвал: Тёмный', category: 'footer', icon: 'fa-moon',
        html: `<footer class="section footer-dark" style="padding: 80px 20px 40px; background: #0f172a;"><div style="max-width: 1200px; margin: 0 auto;"><div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; margin-bottom: 60px;"><div><h4 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">MirageML</h4><p style="color: #94a3b8; line-height: 1.7;">Визуальный редактор нового поколения</p></div></div></div></footer>`,
        css: `.footer-dark { min-height: 350px; }`
    },

    // =============================================
    // ВИДЕО (VIDEO) - 4 варианта
    // =============================================
    {
        id: 'video-1', name: 'Видео: На фоне', category: 'video', icon: 'fa-film',
        html: `<section class="section video-background" style="padding: 140px 20px; text-align: center; min-height: 700px; display: flex; align-items: center; position: relative; overflow: hidden;"><video autoplay muted loop style="position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); z-index: 0;"><source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4" type="video/mp4"></video><div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 1;"></div><div style="position: relative; z-index: 2;"><h2 style="font-size: 48px; color: #ffffff; margin-bottom: 24px;">Видео презентация</h2></div></section>`,
        css: `.video-background { min-height: 700px; }`
    },
    {
        id: 'video-2', name: 'Видео: С превью', category: 'video', icon: 'fa-video',
        html: `<section class="section video-preview" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><div style="position: relative; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15);"><img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200" alt="Video" style="width: 100%; height: 600px; object-fit: cover;"></div></div></section>`,
        css: `.video-preview { min-height: 600px; }`
    },
    {
        id: 'video-3', name: 'Видео: YouTube', category: 'video', icon: 'fa-youtube',
        html: `<section class="section video-youtube" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 20px;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video"></iframe></div></div></section>`,
        css: `.video-youtube { min-height: 600px; }`
    },
    {
        id: 'video-4', name: 'Видео: С описанием', category: 'video', icon: 'fa-play-circle',
        html: `<section class="section video-description" style="padding: 100px 20px;"><div style="max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;"><div><div style="position: relative; border-radius: 20px; overflow: hidden;"><img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800" alt="Video" style="width: 100%; height: 400px; object-fit: cover;"></div></div><div><h2 style="font-size: 36px; color: #1a202c; margin-bottom: 20px;">О нашем продукте</h2><p style="color: #64748b; line-height: 1.7;">Подробный рассказ о возможностях платформы</p></div></div></section>`,
        css: `.video-description { min-height: 500px; }`
    },

    // =============================================
    // РАЗДЕЛИТЕЛЬ (DIVIDER) - 4 варианта
    // =============================================
    {
        id: 'divider-1', name: 'Разделитель: Линия', category: 'divider', icon: 'fa-minus',
        html: `<section class="section divider-line" style="padding: 40px 20px; background: #ffffff;"><hr style="border: none; height: 2px; background: linear-gradient(90deg, transparent, #6366f1, transparent); max-width: 600px; margin: 0 auto;"></section>`,
        css: `.divider-line { min-height: 80px; }`
    },
    {
        id: 'divider-2', name: 'Разделитель: Волна', category: 'divider', icon: 'fa-wave-square',
        html: `<section class="section divider-wave" style="padding: 0;"><svg viewBox="0 0 1200 60" preserveAspectRatio="none" style="width: 100%; height: 60px; display: block;"><path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z" fill="#f8fafc"></path></svg></section>`,
        css: `.divider-wave { min-height: 60px; }`
    },
    {
        id: 'divider-3', name: 'Разделитель: Точки', category: 'divider', icon: 'fa-ellipsis-h',
        html: `<section class="section divider-dots" style="padding: 40px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto; text-align: center;"><div style="display: flex; justify-content: center; gap: 12px;"><div style="width: 8px; height: 8px; background: #6366f1; border-radius: 50%;"></div><div style="width: 8px; height: 8px; background: #6366f1; border-radius: 50%;"></div><div style="width: 8px; height: 8px; background: #6366f1; border-radius: 50%;"></div></div></div></section>`,
        css: `.divider-dots { min-height: 100px; }`
    },
    {
        id: 'divider-4', name: 'Разделитель: Узор', category: 'divider', icon: 'fa-asterisk',
        html: `<section class="section divider-pattern" style="padding: 40px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto; text-align: center;"><div style="font-size: 24px; color: #6366f1; letter-spacing: 20px;">✦ ✦ ✦</div></div></section>`,
        css: `.divider-pattern { min-height: 100px; }`
    },

    // =============================================
    // ТАРИФЫ (PRICING) - 4 варианта
    // =============================================
    {
        id: 'pricing-1', name: 'Тарифы: 3 карточки', category: 'pricing', icon: 'fa-tags',
        html: `<section class="section pricing-cards" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Тарифные планы</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;"><div style="background: white; padding: 40px; border-radius: 20px;"><h3 style="font-size: 24px; color: #1a202c;">Старт</h3><div style="font-size: 48px; font-weight: 800; color: #1a202c; margin: 16px 0;">9 900 ₽</div><button style="width: 100%; padding: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer;">Выбрать</button></div></div></div></section>`,
        css: `.pricing-cards { min-height: 500px; }`
    },
    {
        id: 'pricing-2', name: 'Тарифы: 2 колонки', category: 'pricing', icon: 'fa-columns',
        html: `<section class="section pricing-columns" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Тарифы</h2><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;"><div style="background: #f8fafc; padding: 40px; border-radius: 20px;"><h3 style="font-size: 24px; color: #1a202c;">Базовый</h3><div style="font-size: 48px; font-weight: 800; color: #1a202c; margin: 16px 0;">990 ₽</div></div><div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; border-radius: 20px;"><h3 style="font-size: 24px; color: #ffffff;">Профи</h3><div style="font-size: 48px; font-weight: 800; color: #ffffff; margin: 16px 0;">2 490 ₽</div></div></div></div></section>`,
        css: `.pricing-columns { min-height: 500px; }`
    },
    {
        id: 'pricing-3', name: 'Тарифы: Переключатель', category: 'pricing', icon: 'fa-toggle-on',
        html: `<section class="section pricing-toggle" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 40px; font-weight: 700;">Тарифы</h2><div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 64px;"><button style="padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Ежемесячно</button><button style="padding: 14px 32px; background: transparent; color: #64748b; border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer; font-weight: 600;">Ежегодно</button></div></div></section>`,
        css: `.pricing-toggle { min-height: 650px; }`
    },
    {
        id: 'pricing-4', name: 'Тарифы: Горизонтальный', category: 'pricing', icon: 'fa-arrows-alt-h',
        html: `<section class="section pricing-horizontal" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Тарифные планы</h2></div></section>`,
        css: `.pricing-horizontal { min-height: 500px; }`
    },

    // =============================================
    // FAQ - 2 варианта
    // =============================================
    {
        id: 'faq-1', name: 'FAQ: Вопросы', category: 'faq', icon: 'fa-question-circle',
        html: `<section class="section faq-accordion" style="padding: 100px 20px; background: #f8fafc;"><div style="max-width: 900px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Частые вопросы</h2><div style="display: flex; flex-direction: column; gap: 16px;"><div style="background: white; padding: 30px; border-radius: 16px;"><h3 style="font-size: 20px; color: #1a202c; margin-bottom: 12px; font-weight: 600;">Сколько времени занимает разработка?</h3><p style="color: #64748b; line-height: 1.7;">Обычно от 5 до 14 рабочих дней в зависимости от сложности проекта.</p></div><div style="background: white; padding: 30px; border-radius: 16px;"><h3 style="font-size: 20px; color: #1a202c; margin-bottom: 12px; font-weight: 600;">Какая стоимость разработки?</h3><p style="color: #64748b; line-height: 1.7;">Стоимость начинается от 9 900₽ и зависит от функционала.</p></div></div></div></section>`,
        css: `.faq-accordion { min-height: 600px; }`
    },
    {
        id: 'faq-2', name: 'FAQ: Минимализм', category: 'faq', icon: 'fa-question',
        html: `<section class="section faq-minimal" style="padding: 100px 20px; background: #ffffff;"><div style="max-width: 900px; margin: 0 auto;"><h2 style="text-align: center; font-size: 42px; color: #1a202c; margin-bottom: 64px; font-weight: 700;">Вопросы и ответы</h2></div></section>`,
        css: `.faq-minimal { min-height: 400px; }`
    },

    // =============================================
    // CTA (CALL TO ACTION) - 4 варианта
    // =============================================
    {
        id: 'cta-1', name: 'CTA: Призыв', category: 'cta', icon: 'fa-bullhorn',
        html: `<section class="section cta-classic" style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="max-width: 800px; margin: 0 auto;"><h2 style="font-size: 42px; color: #ffffff; margin-bottom: 24px; font-weight: 700;">Готовы начать проект?</h2><p style="font-size: 20px; color: rgba(255,255,255,0.9); margin-bottom: 40px;">Оставьте заявку сейчас и получите скидку 20%</p><button style="padding: 18px 42px; font-size: 18px; background: #ffffff; color: #667eea; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Оставить заявку</button></div></section>`,
        css: `.cta-classic { min-height: 400px; }`
    },
    {
        id: 'cta-2', name: 'CTA: Тёмный', category: 'cta', icon: 'fa-moon',
        html: `<section class="section cta-dark" style="padding: 100px 20px; text-align: center; background: #0f172a;"><div style="max-width: 800px; margin: 0 auto;"><h2 style="font-size: 42px; color: #ffffff; margin-bottom: 24px; font-weight: 700;">Начните прямо сейчас</h2><p style="font-size: 20px; color: #94a3b8; margin-bottom: 40px;">Первая консультация бесплатно</p><button style="padding: 18px 42px; font-size: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Записаться</button></div></section>`,
        css: `.cta-dark { min-height: 400px; }`
    },
    {
        id: 'cta-3', name: 'CTA: С формой', category: 'cta', icon: 'fa-form',
        html: `<section class="section cta-form" style="padding: 100px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"><div style="max-width: 1200px; margin: 0 auto; text-align: center;"><h2 style="font-size: 42px; color: #ffffff; margin-bottom: 24px; font-weight: 700;">Получите консультацию</h2><p style="font-size: 20px; color: rgba(255,255,255,0.9); margin-bottom: 40px;">Оставьте свои контакты и мы свяжемся с вами</p><form style="max-width: 500px; margin: 0 auto; display: flex; gap: 12px;"><input type="email" placeholder="Email" style="flex: 1; padding: 16px; border: none; border-radius: 10px;"><button style="padding: 16px 32px; background: #1a202c; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600;">Отправить</button></form></div></section>`,
        css: `.cta-form { min-height: 450px; }`
    },
    {
        id: 'cta-4', name: 'CTA: Минимализм', category: 'cta', icon: 'fa-minus',
        html: `<section class="section cta-minimal" style="padding: 100px 20px; text-align: center; background: #ffffff;"><div style="max-width: 800px; margin: 0 auto;"><h2 style="font-size: 42px; color: #1a202c; margin-bottom: 24px; font-weight: 700;">Есть вопросы?</h2><p style="font-size: 20px; color: #64748b; margin-bottom: 40px;">Мы всегда готовы помочь</p><a href="#" style="color: #6366f1; text-decoration: none; font-weight: 600; font-size: 18px; padding-bottom: 8px; border-bottom: 2px solid #6366f1;">Связаться с нами →</a></div></section>`,
        css: `.cta-minimal { min-height: 350px; }`
    }
];

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECTIONS_LIBRARY;
}
