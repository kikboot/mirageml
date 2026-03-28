const SECTION_CATEGORIES = {
    cover: { icon: 'fa-star', name: 'Обложка (Hero)', expanded: false },
    about: { icon: 'fa-building', name: 'О проекте', expanded: false },
    header: { icon: 'fa-heading', name: 'Заголовки', expanded: false },
    text: { icon: 'fa-paragraph', name: 'Текстовые блоки', expanded: false },
    image: { icon: 'fa-image', name: 'Изображения', expanded: false },
    gallery: { icon: 'fa-images', name: 'Галереи', expanded: false },
    features: { icon: 'fa-th-large', name: 'Преимущества', expanded: false },
    team: { icon: 'fa-users', name: 'Команда', expanded: false },
    testimonials: { icon: 'fa-comments', name: 'Отзывы', expanded: false },
    contact: { icon: 'fa-envelope', name: 'Контакты', expanded: false },
    form: { icon: 'fa-file-alt', name: 'Формы', expanded: false },
    pricing: { icon: 'fa-tags', name: 'Тарифы', expanded: false },
    footer: { icon: 'fa-window-minimize', name: 'Подвал (Footer)', expanded: false },
    cta: { icon: 'fa-bullhorn', name: 'CTA блоки', expanded: false },
    faq: { icon: 'fa-question-circle', name: 'FAQ', expanded: false },
    steps: { icon: 'fa-list-ol', name: 'Шаги/Процесс', expanded: false },
    logo: { icon: 'fa-shield-alt', name: 'Логотипы/Клиенты', expanded: false }
};

const SECTIONS_LIBRARY = [
    {
        id: 'hero-1',
        name: 'Hero: Классический градиент',
        category: 'cover',
        icon: 'fa-star',
        html: `
<section class="section hero-gradient-premium" style="padding: 140px 20px; min-height: 700px; display: flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden;">
    <div style="position: absolute; top: -50%; right: -10%; width: 600px; height: 600px; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px);"></div>
    <div style="position: absolute; bottom: -30%; left: -5%; width: 400px; height: 400px; background: rgba(255,255,255,0.08); border-radius: 50%; filter: blur(50px);"></div>
    <div style="max-width: 1200px; margin: 0 auto; text-align: center; position: relative; z-index: 2;">
        <span style="display: inline-block; padding: 8px 20px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 50px; color: #fff; font-size: 14px; font-weight: 500; margin-bottom: 24px; backdrop-filter: blur(10px);">🚀 Запустите свой проект сегодня</span>
        <h1 style="font-size: 64px; font-weight: 800; color: #ffffff; margin-bottom: 24px; line-height: 1.1; letter-spacing: -1px;">Создавайте будущее <br>вашего бизнеса</h1>
        <p style="font-size: 20px; color: rgba(255,255,255,0.9); max-width: 650px; margin: 0 auto 48px; line-height: 1.6;">Мы разрабатываем цифровые решения, которые помогают компаниям расти и достигать новых высот</p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <button style="padding: 18px 42px; font-size: 17px; background: #ffffff; color: #667eea; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; box-shadow: 0 10px 40px rgba(0,0,0,0.2); transition: all 0.3s ease;">Начать проект</button>
            <button style="padding: 18px 42px; font-size: 17px; background: transparent; color: #ffffff; border: 2px solid rgba(255,255,255,0.5); border-radius: 12px; cursor: pointer; font-weight: 600; backdrop-filter: blur(10px);">Узнать больше</button>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 40px; margin-top: 60px; flex-wrap: wrap;">
            <div style="text-align: center;">
                <div style="font-size: 32px; font-weight: 800; color: #fff;">500+</div>
                <div style="font-size: 14px; color: rgba(255,255,255,0.7);">Проектов</div>
            </div>
            <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
            <div style="text-align: center;">
                <div style="font-size: 32px; font-weight: 800; color: #fff;">98%</div>
                <div style="font-size: 14px; color: rgba(255,255,255,0.7);">Довольных</div>
            </div>
            <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
            <div style="text-align: center;">
                <div style="font-size: 32px; font-weight: 800; color: #fff;">10+</div>
                <div style="font-size: 14px; color: rgba(255,255,255,0.7);">Лет опыта</div>
            </div>
        </div>
    </div>
</section>`,
        css: `.hero-gradient-premium { min-height: 700px; }`
    },
    {
        id: 'hero-2',
        name: 'Hero: Сплит с изображением',
        category: 'cover',
        icon: 'fa-image',
        html: `
<section class="section hero-split-premium" style="padding: 0; min-height: 750px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; max-width: 1400px; margin: 0 auto; min-height: 750px;">
        <div style="display: flex; flex-direction: column; justify-content: center; padding: 80px 60px; background: #f8fafc; position: relative;">
            <span style="position: absolute; top: 40px; left: 60px; font-size: 14px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 2px;">Добро пожаловать</span>
            <h1 style="font-size: 56px; font-weight: 800; color: #1a202c; margin-bottom: 28px; line-height: 1.1; letter-spacing: -1px;">Инновации для <span style="background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">вашего успеха</span></h1>
            <p style="font-size: 19px; color: #64748b; margin-bottom: 40px; line-height: 1.7;">Мы создаём технологические решения, которые трансформируют бизнес и приносят измеримые результаты</p>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <button style="padding: 16px 36px; font-size: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; box-shadow: 0 8px 30px rgba(99,102,241,0.3);">Оставить заявку</button>
                <button style="padding: 16px 36px; font-size: 16px; background: white; color: #1a202c; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; font-weight: 600;">Наши работы</button>
            </div>
            <div style="display: flex; align-items: center; gap: 20px; margin-top: 50px;">
                <div style="display: flex;">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50" style="width: 45px; height: 45px; border-radius: 50%; border: 3px solid white; margin-right: -12px; object-fit: cover;">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50" style="width: 45px; height: 45px; border-radius: 50%; border: 3px solid white; margin-right: -12px; object-fit: cover;">
                    <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=50" style="width: 45px; height: 45px; border-radius: 50%; border: 3px solid white; margin-right: -12px; object-fit: cover;">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" style="width: 45px; height: 45px; border-radius: 50%; border: 3px solid white; object-fit: cover;">
                </div>
                <div>
                    <div style="font-weight: 700; color: #1a202c;">2000+ клиентов</div>
                    <div style="font-size: 13px; color: #64748b;">Доверяют нам</div>
                </div>
            </div>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden;">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;">
            <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(102,126,234,0.8), rgba(118,75,162,0.6));"></div>
        </div>
    </div>
</section>`,
        css: `.hero-split-premium { min-height: 750px; }`
    },
    {
        id: 'hero-3',
        name: 'Hero: Тёмный с неоновым эффектом',
        category: 'cover',
        icon: 'fa-moon',
        html: `
<section class="section hero-dark-neon" style="padding: 140px 20px; min-height: 700px; display: flex; align-items: center; background: #0f172a; position: relative; overflow: hidden;">
    <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); filter: blur(60px);"></div>
    <div style="max-width: 1200px; margin: 0 auto; text-align: center; position: relative; z-index: 2;">
        <div style="display: inline-flex; align-items: center; gap: 10px; padding: 10px 24px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 50px; margin-bottom: 32px;">
            <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></span>
            <span style="color: #94a3b8; font-size: 14px; font-weight: 500;">Мы открыты для новых проектов</span>
        </div>
        <h1 style="font-size: 72px; font-weight: 900; color: #ffffff; margin-bottom: 28px; line-height: 1; letter-spacing: -2px; text-shadow: 0 0 60px rgba(99,102,241,0.5);">
            Цифровая<br>
            <span style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">трансформация</span>
        </h1>
        <p style="font-size: 21px; color: #94a3b8; max-width: 700px; margin: 0 auto 48px; line-height: 1.7;">Превращаем сложные бизнес-задачи в элегантные цифровые решения</p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <button style="padding: 20px 48px; font-size: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 14px; cursor: pointer; font-weight: 700; box-shadow: 0 10px 50px rgba(99,102,241,0.4);">Обсудить проект</button>
            <button style="padding: 20px 48px; font-size: 18px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 14px; cursor: pointer; font-weight: 600; backdrop-filter: blur(10px);">Портфолио</button>
        </div>
    </div>
</section>`,
        css: `.hero-dark-neon { min-height: 700px; } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`
    },
    {
        id: 'hero-4',
        name: 'Hero: Минимализм с типографикой',
        category: 'cover',
        icon: 'fa-font',
        html: `
<section class="section hero-minimal-type" style="padding: 160px 20px; background: #ffffff; min-height: 650px;">
    <div style="max-width: 1400px; margin: 0 auto;">
        <h1 style="font-size: 80px; font-weight: 300; color: #1a202c; line-height: 1; letter-spacing: -3px; margin-bottom: 40px;">
            Меньше.<br>
            <span style="font-weight: 700;">Но лучше.</span>
        </h1>
        <p style="font-size: 22px; color: #64748b; max-width: 600px; margin-bottom: 48px; line-height: 1.6;">Создаём элегантные решения для сложных задач. Простота — наша философия.</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <button style="padding: 18px 40px; font-size: 16px; background: #1a202c; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500;">Связаться</button>
            <button style="padding: 18px 40px; font-size: 16px; background: transparent; color: #1a202c; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; font-weight: 500;">О студии</button>
        </div>
    </div>
</section>`,
        css: `.hero-minimal-type { min-height: 650px; }`
    },
    {
        id: 'hero-5',
        name: 'Hero: С формой захвата',
        category: 'cover',
        icon: 'fa-form',
        html: `
<section class="section hero-lead-form" style="padding: 120px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 700px; display: flex; align-items: center;">
    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;">
        <div>
            <span style="display: inline-block; padding: 6px 16px; background: rgba(255,255,255,0.2); border-radius: 20px; color: #fff; font-size: 13px; font-weight: 600; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">Бесплатная консультация</span>
            <h1 style="font-size: 54px; font-weight: 800; color: #ffffff; margin-bottom: 24px; line-height: 1.1;">Начните трансформацию бизнеса</h1>
            <p style="font-size: 19px; color: rgba(255,255,255,0.9); margin-bottom: 32px; line-height: 1.6;">Оставьте заявку и получите персональное предложение в течение 15 минут</p>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">✓</div>
                    <span style="color: #fff; font-size: 15px;">Бесплатно</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 24px; background: rgba(255,255,255,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center;">✓</div>
                    <span style="color: #fff; font-size: 15px;">Без обязательств</span>
                </div>
            </div>
        </div>
        <div style="background: white; padding: 48px; border-radius: 24px; box-shadow: 0 25px 80px rgba(0,0,0,0.25);">
            <h3 style="font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 24px;">Заполните форму</h3>
            <form style="display: flex; flex-direction: column; gap: 16px;">
                <input type="text" placeholder="Ваше имя" style="padding: 16px 20px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; background: #f8fafc;">
                <input type="tel" placeholder="+7 (___) ___-__-__" style="padding: 16px 20px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; background: #f8fafc;">
                <input type="email" placeholder="Email" style="padding: 16px 20px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; background: #f8fafc;">
                <button type="submit" style="padding: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 25px rgba(99,102,241,0.3);">Получить консультацию</button>
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
            </form>
        </div>
    </div>
</section>`,
        css: `.hero-lead-form { min-height: 700px; }`
    },
    {
        id: 'hero-6',
        name: 'Hero: С видео фоном',
        category: 'cover',
        icon: 'fa-video',
        html: `
<section class="section hero-video-bg" style="padding: 140px 20px; min-height: 750px; display: flex; align-items: center; position: relative; overflow: hidden;">
    <video autoplay muted loop playsinline style="position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; width: auto; height: auto; transform: translate(-50%, -50%); z-index: 0; opacity: 0.4;">
        <source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4" type="video/mp4">
    </video>
    <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8)); z-index: 1;"></div>
    <div style="max-width: 1200px; margin: 0 auto; text-align: center; position: relative; z-index: 2;">
        <h1 style="font-size: 68px; font-weight: 900; color: #ffffff; margin-bottom: 24px; line-height: 1; letter-spacing: -2px;">Будущее начинается<br>сегодня</h1>
        <p style="font-size: 22px; color: rgba(255,255,255,0.8); max-width: 700px; margin: 0 auto 48px; line-height: 1.6;">Технологии, которые изменят ваш бизнес навсегда</p>
        <button style="padding: 20px 50px; font-size: 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 14px; cursor: pointer; font-weight: 700; box-shadow: 0 15px 50px rgba(99,102,241,0.4);">Начать путешествие</button>
    </div>
</section>`,
        css: `.hero-video-bg { min-height: 750px; }`
    },
    {
        id: 'hero-7',
        name: 'Hero: Корпоративный стиль',
        category: 'cover',
        icon: 'fa-building',
        html: `
<section class="section hero-corporate" style="padding: 0; min-height: 700px; background: #f8fafc;">
    <div style="max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; padding: 80px 40px; align-items: center;">
        <div style="padding: 60px 40px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 24px; font-weight: 800;">M</span>
                </div>
                <span style="font-size: 24px; font-weight: 700; color: #1a202c;">MirageML</span>
            </div>
            <h1 style="font-size: 52px; font-weight: 800; color: #1a202c; margin-bottom: 24px; line-height: 1.1;">Эксперты в цифровой трансформации</h1>
            <p style="font-size: 19px; color: #64748b; margin-bottom: 36px; line-height: 1.7;">Помогаем компаниям внедрять инновации и достигать измеримых результатов</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
                <div style="padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 32px; font-weight: 800; color: #6366f1; margin-bottom: 4px;">15+</div>
                    <div style="font-size: 14px; color: #64748b;">Лет на рынке</div>
                </div>
                <div style="padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 32px; font-weight: 800; color: #10b981; margin-bottom: 4px;">500+</div>
                    <div style="font-size: 14px; color: #64748b;">Проектов</div>
                </div>
            </div>
            <button style="padding: 16px 36px; font-size: 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Связаться с нами</button>
        </div>
        <div style="position: relative;">
            <div style="position: absolute; top: -20px; right: -20px; width: 200px; height: 200px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 24px; opacity: 0.1; z-index: 0;"></div>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" style="width: 100%; height: 550px; object-fit: cover; border-radius: 24px; position: relative; z-index: 1; box-shadow: 0 25px 80px rgba(0,0,0,0.15);">
        </div>
    </div>
</section>`,
        css: `.hero-corporate { min-height: 700px; }`
    },
    {
        id: 'hero-8',
        name: 'Hero: Креативный с 3D',
        category: 'cover',
        icon: 'fa-cube',
        html: `
<section class="section hero-creative-3d" style="padding: 100px 20px; min-height: 700px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); display: flex; align-items: center; overflow: hidden;">
    <div style="max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
        <div>
            <span style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1px solid rgba(99,102,241,0.3); border-radius: 50px; color: #a855f7; font-size: 14px; font-weight: 600; margin-bottom: 24px;">🎨 Креативная студия</span>
            <h1 style="font-size: 58px; font-weight: 900; color: #ffffff; margin-bottom: 24px; line-height: 1.1; letter-spacing: -1px;">Создаём цифровое<br><span style="background: linear-gradient(135deg, #f472b6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">искусство</span></h1>
            <p style="font-size: 19px; color: #94a3b8; margin-bottom: 36px; line-height: 1.7;">От концепции до реализации — воплощаем самые смелые идеи</p>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <button style="padding: 16px 36px; font-size: 16px; background: linear-gradient(135deg, #ec4899, #a855f7); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; box-shadow: 0 10px 40px rgba(236,72,153,0.3);">Смотреть работы</button>
                <button style="padding: 16px 36px; font-size: 16px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; cursor: pointer; font-weight: 600;">О студии</button>
            </div>
        </div>
        <div style="position: relative; height: 500px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 400px; height: 400px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; animation: morphing 8s ease-in-out infinite; opacity: 0.6; filter: blur(40px);"></div>
            <div style="position: relative; z-index: 2; width: 300px; height: 300px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 25px 80px rgba(99,102,241,0.4); transform: rotate(-10deg);">
                <span style="font-size: 120px; color: rgba(255,255,255,0.2); font-weight: 900;">3D</span>
            </div>
        </div>
    </div>
</section>`,
        css: `.hero-creative-3d { min-height: 700px; } @keyframes morphing { 0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; } 50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; } }`
    },
    {
        id: 'hero-9',
        name: 'Hero: Стартап',
        category: 'cover',
        icon: 'fa-rocket',
        html: `
<section class="section hero-startup" style="padding: 120px 20px; background: #ffffff; min-height: 680px;">
    <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 50px; margin-bottom: 28px;">
            <span style="font-size: 16px;">🚀</span>
            <span style="color: #0369a1; font-size: 14px; font-weight: 600;">Запуск через 3 дня</span>
        </div>
        <h1 style="font-size: 64px; font-weight: 900; color: #0f172a; margin-bottom: 24px; line-height: 1; letter-spacing: -2px;">Революция в<br>вашей индустрии</h1>
        <p style="font-size: 21px; color: #64748b; max-width: 650px; margin: 0 auto 40px; line-height: 1.6;">Первая платформа, которая объединяет все инструменты в одном месте</p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 50px;">
            <button style="padding: 18px 42px; font-size: 17px; background: #0f172a; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Получить ранний доступ</button>
            <button style="padding: 18px 42px; font-size: 17px; background: #f1f5f9; color: #0f172a; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">Узнать больше</button>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 30px; flex-wrap: wrap;">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" style="height: 30px; opacity: 0.6;">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" style="height: 30px; opacity: 0.6;">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg" style="height: 30px; opacity: 0.6;">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" style="height: 30px; opacity: 0.6;">
        </div>
    </div>
</section>`,
        css: `.hero-startup { min-height: 680px; }`
    },
    {
        id: 'hero-10',
        name: 'Hero: Агентство',
        category: 'cover',
        icon: 'fa-briefcase',
        html: `
<section class="section hero-agency" style="padding: 0; min-height: 750px; background: #0a0a0a;">
    <div style="max-width: 1600px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; min-height: 750px;">
        <div style="padding: 100px 60px; display: flex; flex-direction: column; justify-content: center;">
            <span style="font-size: 14px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 20px;">Digital-агентство полного цикла</span>
            <h1 style="font-size: 60px; font-weight: 900; color: #ffffff; margin-bottom: 28px; line-height: 1.1; letter-spacing: -2px;">Мы создаём<br>бренды будущего</h1>
            <p style="font-size: 19px; color: #94a3b8; margin-bottom: 40px; line-height: 1.7;">Стратегия, дизайн, разработка и маркетинг — всё в одном месте</p>
            <div style="display: flex; gap: 40px; margin-bottom: 50px;">
                <div>
                    <div style="font-size: 42px; font-weight: 900; color: #6366f1; line-height: 1;">150+</div>
                    <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Проектов</div>
                </div>
                <div>
                    <div style="font-size: 42px; font-weight: 900; color: #10b981; line-height: 1;">12</div>
                    <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Наград</div>
                </div>
                <div>
                    <div style="font-size: 42px; font-weight: 900; color: #f59e0b; line-height: 1;">8+</div>
                    <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Лет опыта</div>
                </div>
            </div>
            <button style="padding: 18px 42px; font-size: 17px; background: #6366f1; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; width: fit-content;">Обсудить проект</button>
        </div>
        <div style="position: relative; overflow: hidden;">
            <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(10,10,10,0.8), transparent);"></div>
        </div>
    </div>
</section>`,
        css: `.hero-agency { min-height: 750px; }`
    }
];

function getSectionsByCategory() {
    const grouped = {};
    SECTIONS_LIBRARY.forEach(section => {
        if (!grouped[section.category]) {
            grouped[section.category] = [];
        }
        grouped[section.category].push(section);
    });
    return grouped;
}

function getSectionsCount(category) {
    return SECTIONS_LIBRARY.filter(s => s.category === category).length;
}

function getTotalSectionsCount() {
    return SECTIONS_LIBRARY.length;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SECTIONS_LIBRARY, SECTION_CATEGORIES, getSectionsByCategory, getSectionsCount, getTotalSectionsCount };
}