document.addEventListener('DOMContentLoaded', function() {
    // Загружаем SQL.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    script.integrity = 'sha512-OMqo8p3h8X3w5L8NyNp0kK5j2J5GjnRqVPe2Q5H2YFJkZEnxRkO2h6kNPOH70Jd4bXia9QfV2L7wNm3+x6OCTw==';
    script.crossOrigin = 'anonymous';
    script.onload = async function() {
        // Инициализируем SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Создаем приложение
        const app = new ProfileApp(SQL);
        await app.init();
    };
    document.head.appendChild(script);
});

class UserDatabase {
    constructor(SQL) {
        this.SQL = SQL;
        this.db = null;
        this.dbName = 'UserProfileDB.db';
    }

    async init() {
        try {
            // Пытаемся загрузить существующую базу данных из LocalStorage
            const storedDb = localStorage.getItem(this.dbName);

            if (storedDb) {
                const buffer = Uint8Array.from(storedDb.split(',').map(Number)).buffer;
                this.db = new this.SQL.Database(new Uint8Array(buffer));
            } else {
                // Создаем новую базу данных
                this.db = new this.SQL.Database();
                this.createTables();
            }

            return true;
        } catch (error) {
            console.error('Ошибка инициализации базы данных:', error);
            return false;
        }
    }

    createTables() {
        // Создаем таблицу пользователей
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                                                 email TEXT PRIMARY KEY,
                                                 password TEXT NOT NULL,
                                                 lastName TEXT NOT NULL,
                                                 firstName TEXT NOT NULL,
                                                 middleName TEXT NOT NULL,
                                                 sex TEXT NOT NULL,
                                                 phone TEXT NOT NULL,
                                                 education TEXT,
                                                 about TEXT,
                                                 foreignLang INTEGER DEFAULT 0,
                                                 profession TEXT,
                                                 birthdate TEXT,
                                                 country TEXT,
                                                 region TEXT,
                                                 city TEXT,
                                                 address TEXT,
                                                 photo TEXT
            )
        `);

        // Создаем таблицу социальных ссылок
        this.db.run(`
            CREATE TABLE IF NOT EXISTS social_links (
                                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        email TEXT NOT NULL,
                                                        type TEXT NOT NULL,
                                                        url TEXT NOT NULL,
                                                        FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE
                )
        `);

        // Создаем таблицу навыков
        this.db.run(`
            CREATE TABLE IF NOT EXISTS skills (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  email TEXT NOT NULL,
                                                  skill_id TEXT NOT NULL,
                                                  value INTEGER NOT NULL,
                                                  FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE
                )
        `);

        // Сохраняем базу данных в LocalStorage
        this.saveToStorage();
    }

    saveToStorage() {
        if (this.db) {
            const data = this.db.export();
            const array = Array.from(new Uint8Array(data));
            localStorage.setItem(this.dbName, array.toString());
        }
    }

    async saveUser(userData) {
        try {
            // Начинаем транзакцию
            this.db.exec('BEGIN TRANSACTION');

            const profile = userData.personalInfo;

            // Проверяем, существует ли пользователь
            const userExists = this.db.exec('SELECT email FROM users WHERE email = ?', [profile.email]);

            if (userExists.length > 0) {
                // Обновляем существующего пользователя
                this.db.run(
                    `UPDATE users SET 
                        password = ?, 
                        lastName = ?, 
                        firstName = ?, 
                        middleName = ?, 
                        sex = ?, 
                        phone = ?, 
                        education = ?, 
                        about = ?, 
                        foreignLang = ?, 
                        profession = ?, 
                        birthdate = ?, 
                        country = ?, 
                        region = ?, 
                        city = ?, 
                        address = ?, 
                        photo = ? 
                    WHERE email = ?`,
                    [
                        userData.password,
                        profile.lastName,
                        profile.firstName,
                        profile.middleName,
                        profile.sex,
                        profile.phone,
                        profile.education,
                        profile.about,
                        profile.foreignLang ? 1 : 0,
                        userData.profession,
                        userData.birthdate,
                        userData.location.country,
                        userData.location.region,
                        userData.location.city,
                        userData.location.address,
                        userData.photo,
                        profile.email
                    ]
                );
            } else {
                // Вставляем нового пользователя
                this.db.run(
                    `INSERT INTO users (email, password, lastName, firstName, middleName, sex, phone, education, about, foreignLang, profession, birthdate, country, region, city, address, photo)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        profile.email,
                        userData.password,
                        profile.lastName,
                        profile.firstName,
                        profile.middleName,
                        profile.sex,
                        profile.phone,
                        profile.education,
                        profile.about,
                        profile.foreignLang ? 1 : 0,
                        userData.profession,
                        userData.birthdate,
                        userData.location.country,
                        userData.location.region,
                        userData.location.city,
                        userData.location.address,
                        userData.photo
                    ]
                );
            }

            // Удаляем старые социальные ссылки
            this.db.run('DELETE FROM social_links WHERE email = ?', [profile.email]);

            // Сохраняем новые социальные ссылки
            userData.socialLinks.forEach(link => {
                this.db.run(
                    'INSERT INTO social_links (email, type, url) VALUES (?, ?, ?)',
                    [profile.email, link.type, link.url]
                );
            });

            // Удаляем старые навыки
            this.db.run('DELETE FROM skills WHERE email = ?', [profile.email]);

            // Сохраняем новые навыки
            for (const [skillId, value] of Object.entries(userData.skills)) {
                this.db.run(
                    'INSERT INTO skills (email, skill_id, value) VALUES (?, ?, ?)',
                    [profile.email, skillId, value]
                );
            }

            // Завершаем транзакцию
            this.db.exec('COMMIT');

            // Сохраняем базу данных в LocalStorage
            this.saveToStorage();

            return true;
        } catch (error) {
            // Откатываем транзакцию в случае ошибки
            this.db.exec('ROLLBACK');
            console.error('Ошибка сохранения пользователя:', error);
            throw error;
        }
    }

    async getUser(email) {
        try {
            // Получаем основные данные пользователя
            const userResult = this.db.exec('SELECT * FROM users WHERE email = ?', [email]);
            if (userResult.length === 0) {
                return null; // Пользователь не найден
            }

            const user = userResult[0].values[0];
            const columns = userResult[0].columns;

            // Получаем социальные ссылки
            const socialLinks = [];
            const socialResult = this.db.exec('SELECT type, url FROM social_links WHERE email = ?', [email]);
            if (socialResult.length > 0) {
                socialResult[0].values.forEach(row => {
                    socialLinks.push({
                        type: row[0],
                        url: row[1]
                    });
                });
            }

            // Получаем навыки
            const skills = {};
            const skillsResult = this.db.exec('SELECT skill_id, value FROM skills WHERE email = ?', [email]);
            if (skillsResult.length > 0) {
                skillsResult[0].values.forEach(row => {
                    skills[row[0]] = row[1];
                });
            }

            return {
                personalInfo: {
                    lastName: user[columns.indexOf('lastName')],
                    firstName: user[columns.indexOf('firstName')],
                    middleName: user[columns.indexOf('middleName')],
                    sex: user[columns.indexOf('sex')],
                    phone: user[columns.indexOf('phone')],
                    email: user[columns.indexOf('email')],
                    education: user[columns.indexOf('education')],
                    about: user[columns.indexOf('about')],
                    foreignLang: Boolean(user[columns.indexOf('foreignLang')])
                },
                profession: user[columns.indexOf('profession')],
                skills: skills,
                location: {
                    country: user[columns.indexOf('country')],
                    region: user[columns.indexOf('region')],
                    city: user[columns.indexOf('city')],
                    address: user[columns.indexOf('address')]
                },
                birthdate: user[columns.indexOf('birthdate')],
                socialLinks: socialLinks,
                photo: user[columns.indexOf('photo')]
            };
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            throw error;
        }
    }

    async authenticateUser(email, password) {
        try {
            const result = this.db.exec('SELECT email FROM users WHERE email = ? AND password = ?', [email, password]);
            return result.length > 0;
        } catch (error) {
            console.error('Ошибка аутентификации:', error);
            return false;
        }
    }
}

class ProfileApp {
    constructor(SQL) {
        this.cropper = null;
        this.currentImageFile = null;
        this.db = new UserDatabase(SQL);
    }

    async init() {
        await this.loadJSONData();
        await this.db.init();
        this.setupEventListeners();
        this.populateProfessions();

        // Проверяем, есть ли сохраненный пользователь
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            document.getElementById('email').value = savedUser;
            this.loadUserData();
        }
    }

    async loadJSONData() {
        try {
            const [professionsResponse, locationsResponse] = await Promise.all([
                fetch('professions.json'),
                fetch('locations.json')
            ]);

            window.professionsData = await professionsResponse.json();
            window.locationData = await locationsResponse.json();

            // Сохраняем данные в глобальной области видимости
            window.professionsData = window.professionsData.professions;
            window.locationData = window.locationData.countries;

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Создаем заглушки для продолжения работы
            window.professionsData = [];
            window.locationData = [];
        }
    }

    setupEventListeners() {
        // Навигация
        document.getElementById('back-button').addEventListener('click', () => window.history.back());
        document.getElementById('cancel-button').addEventListener('click', () => {
            if (confirm('Отменить изменения и вернуться назад?')) window.history.back();
        });

        // Загрузка фото
        const photoArea = document.getElementById('photo-upload-area');
        const photoInput = document.getElementById('photo-upload-input');
        photoArea.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));

        // Редактирование фото
        document.getElementById('close-crop-modal').addEventListener('click', () => this.closeCropModal());
        document.getElementById('rotate-left').addEventListener('click', () => this.rotateImage(-90));
        document.getElementById('rotate-right').addEventListener('click', () => this.rotateImage(90));
        document.getElementById('crop-confirm').addEventListener('click', () => this.applyCrop());

        // Профессии и навыки
        document.getElementById('profession-select').addEventListener('change', (e) => this.handleProfessionChange(e));

        // Местоположение
        document.getElementById('country-select').addEventListener('change', (e) => this.handleCountryChange(e));
        document.getElementById('region-select').addEventListener('change', (e) => this.handleRegionChange(e));

        // Социальные сети
        document.querySelector('.btn-plus').addEventListener('click', () => this.addSocialLinkField());
        document.querySelectorAll('.social-select-wrapper').forEach(wrapper => this.initSocialSelect(wrapper));

        // Сохранение данных
        document.getElementById('save-button').addEventListener('click', () => this.saveUserData());
        document.getElementById('email').addEventListener('blur', () => this.loadUserData());

        // Drag and drop для фото
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const photoArea = document.getElementById('photo-upload-area');

        photoArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoArea.classList.add('dragover');
        });

        photoArea.addEventListener('dragleave', () => {
            photoArea.classList.remove('dragover');
        });

        photoArea.addEventListener('drop', (e) => {
            e.preventDefault();
            photoArea.classList.remove('dragover');

            if (e.dataTransfer.files.length) {
                this.currentImageFile = e.dataTransfer.files[0];
                this.openCropModal(this.currentImageFile);
            }
        });
    }

    handlePhotoUpload(e) {
        if (e.target.files.length) {
            this.currentImageFile = e.target.files[0];
            this.openCropModal(this.currentImageFile);
        }
    }

    openCropModal(file) {
        const reader = new FileReader();
        const cropModal = document.getElementById('crop-modal');

        reader.onload = (e) => {
            document.getElementById('crop-image').src = e.target.result;
            cropModal.classList.add('active');

            // Инициализация Cropper.js после загрузки изображения
            setTimeout(() => {
                if (this.cropper) {
                    this.cropper.destroy();
                }

                this.cropper = new Cropper(document.getElementById('crop-image'), {
                    aspectRatio: 1,
                    viewMode: 1,
                    guides: true,
                    background: false,
                    autoCropArea: 0.8,
                    responsive: true,
                    checkCrossOrigin: false
                });
            }, 100);
        };

        reader.readAsDataURL(file);
    }

    closeCropModal() {
        document.getElementById('crop-modal').classList.remove('active');
        if (this.cropper) {
            this.cropper.destroy();
        }
    }

    rotateImage(degrees) {
        if (this.cropper) {
            this.cropper.rotate(degrees);
        }
    }

    applyCrop() {
        if (!this.cropper) return;

        // Получаем обрезанное изображение
        const canvas = this.cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            fillColor: '#fff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        // Конвертируем canvas в blob
        canvas.toBlob((blob) => {
            // Создаем новый файл из blob
            const newFile = new File([blob], this.currentImageFile.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            // Обновляем превью
            const url = URL.createObjectURL(blob);
            const photoArea = document.getElementById('photo-upload-area');
            photoArea.style.backgroundImage = `url(${url})`;
            photoArea.classList.add('has-image');

            // Закрываем модальное окно
            this.closeCropModal();

            // Заменяем файл в input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(newFile);
            document.getElementById('photo-upload-input').files = dataTransfer.files;
        }, 'image/jpeg', 0.9);
    }

    populateProfessions() {
        const professionSelect = document.getElementById('profession-select');

        // Очищаем существующие опции, кроме первой
        while (professionSelect.options.length > 1) {
            professionSelect.remove(1);
        }

        // Заполняем профессии
        window.professionsData.forEach(profession => {
            const option = document.createElement('option');
            option.value = profession.id;
            option.textContent = profession.name;
            professionSelect.appendChild(option);
        });
    }

    handleProfessionChange(e) {
        const professionId = e.target.value;
        this.createSkillSliders(professionId);
    }

    createSkillSliders(professionId) {
        const dynamicSkills = document.getElementById('dynamic-skills');
        dynamicSkills.innerHTML = '';

        if (!professionId) return;

        // Находим выбранную профессию
        const profession = window.professionsData.find(p => p.id === professionId);
        if (!profession) return;

        // Создаем ползунки для навыков
        profession.skills.forEach(skill => {
            const skillSlider = document.createElement('div');
            skillSlider.className = 'skill-slider';
            skillSlider.innerHTML = `
            <div class="skill-name">${skill.name}</div>
            <div class="skill-slider-container">
                <input type="range" min="0" max="100" value="50" class="skill-range" data-skill="${skill.id}">
                <div class="skill-slider-value">50%</div>
            </div>
        `;
            dynamicSkills.appendChild(skillSlider);
        });

        // Добавляем обработчики событий для ползунков
        document.querySelectorAll('.skill-range').forEach(slider => {
            slider.addEventListener('input', function() {
                this.nextElementSibling.textContent = `${this.value}%`;
            });
        });
    }

    handleCountryChange(e) {
        const countryId = e.target.value;
        const regionContainer = document.getElementById('region-container');
        const cityContainer = document.getElementById('city-container');
        const regionSelect = document.getElementById('region-select');
        const citySelect = document.getElementById('city-select');

        regionSelect.innerHTML = '<option value="">Выберите регион</option>';
        citySelect.innerHTML = '<option value="">Выберите город</option>';

        if (countryId) {
            const country = window.locationData.find(c => c.id === countryId);

            if (country && country.regions.length > 0) {
                regionContainer.classList.remove('hidden');

                // Заполняем регионы
                country.regions.forEach(region => {
                    const option = document.createElement('option');
                    option.value = region.id;
                    option.textContent = region.name;
                    regionSelect.appendChild(option);
                });
            } else {
                regionContainer.classList.add('hidden');
            }

            cityContainer.classList.add('hidden');
        } else {
            regionContainer.classList.add('hidden');
            cityContainer.classList.add('hidden');
        }
    }

    handleRegionChange(e) {
        const countryId = document.getElementById('country-select').value;
        const regionId = e.target.value;
        const cityContainer = document.getElementById('city-container');
        const citySelect = document.getElementById('city-select');

        citySelect.innerHTML = '<option value="">Выберите город</option>';

        if (countryId && regionId) {
            const country = window.locationData.find(c => c.id === countryId);
            if (country) {
                const region = country.regions.find(r => r.id === regionId);

                if (region && region.cities.length > 0) {
                    cityContainer.classList.remove('hidden');

                    // Заполняем города
                    region.cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city.id;
                        option.textContent = city.name;
                        citySelect.appendChild(option);
                    });
                } else {
                    cityContainer.classList.add('hidden');
                }
            }
        } else {
            cityContainer.classList.add('hidden');
        }
    }

    addSocialLinkField() {
        const socialContainer = document.getElementById('additional-social-links');
        const newInputGroup = document.createElement('div');
        newInputGroup.className = 'social-input-group';
        newInputGroup.innerHTML = `
            <div class="social-select-wrapper">
                <select class="social-select">
                    <option value="max" data-icon="M">MAX</option>
                    <option value="vk" data-icon="&#xf189;" class="fab">VK</option>
                    <option value="telegram" data-icon="&#xf2c6;" class="fab">Telegram</option>
                    <option value="instagram" data-icon="&#xf16d;" class="fab">Instagram</option>
                    <option value="youtube" data-icon="&#xf167;" class="fab">YouTube</option>
                    <option value="other" data-icon="&#xf0c1;" class="fas">Другая</option>
                </select>
                <div class="social-icon">M</div>
            </div>
            <input type="text" class="input-gray" placeholder="https://...">
            <button type="button" class="btn-minus"><i class="fas fa-minus"></i></button>
        `;
        socialContainer.appendChild(newInputGroup);

        // Инициализация выбора соцсети
        this.initSocialSelect(newInputGroup.querySelector('.social-select-wrapper'));

        // Добавляем обработчик для кнопки удаления
        newInputGroup.querySelector('.btn-minus').addEventListener('click', function() {
            socialContainer.removeChild(newInputGroup);
        });
    }

    initSocialSelect(wrapper) {
        const select = wrapper.querySelector('select');
        const icon = wrapper.querySelector('.social-icon');

        // Установка начальной иконки
        const initialOption = select.options[select.selectedIndex];
        icon.innerHTML = initialOption.getAttribute('data-icon');
        if (initialOption.getAttribute('class')) {
            icon.className = `social-icon ${initialOption.getAttribute('class')}`;
        } else {
            icon.className = 'social-icon';
        }

        // Обработчик изменения выбора
        select.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            icon.innerHTML = selectedOption.getAttribute('data-icon');
            if (selectedOption.getAttribute('class')) {
                icon.className = `social-icon ${selectedOption.getAttribute('class')}`;
            } else {
                icon.className = 'social-icon';
            }
        });
    }

    async saveUserData() {
        const form = document.getElementById('user-data-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Проверяем пароль
        const password = document.getElementById('password').value;
        if (!password) {
            this.showNotification('Пароль обязателен для заполнения', 'error');
            return;
        }

        const saveButton = document.getElementById('save-button');
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';
        saveButton.disabled = true;

        try {
            // Собираем данные пользователя
            const userData = this.collectUserData();

            // Сохраняем в базу данных
            await this.db.saveUser(userData);

            // Сохраняем email текущего пользователя
            localStorage.setItem('currentUser', userData.personalInfo.email);

            // Показываем уведомление об успехе
            this.showNotification('Данные успешно сохранены!');

            // Перенаправляем в личный кабинет через 2 секунды
            setTimeout(() => {
                window.location.href = 'LK.html';
            }, 2000);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            this.showNotification('Ошибка при сохранении данных', 'error');

            // Восстанавливаем кнопку
            saveButton.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
            saveButton.disabled = false;
        }
    }

    collectUserData() {
        const userData = {
            personalInfo: {
                lastName: document.getElementById('lastname').value,
                firstName: document.getElementById('firstname').value,
                middleName: document.getElementById('middlename').value,
                sex: document.querySelector('input[name="sex"]:checked')?.value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                education: document.getElementById('education').value,
                about: document.getElementById('about').value,
                foreignLang: document.getElementById('foreign-lang').checked
            },
            password: document.getElementById('password').value,
            profession: document.getElementById('profession-select').value,
            skills: {},
            location: {
                country: document.getElementById('country-select').value,
                region: document.getElementById('region-select').value,
                city: document.getElementById('city-select').value,
                address: document.getElementById('address-input').value
            },
            birthdate: document.getElementById('birthdate').value,
            socialLinks: this.collectSocialLinks()
        };

        // Сохраняем значения навыков
        document.querySelectorAll('.skill-range').forEach(slider => {
            userData.skills[slider.dataset.skill] = slider.value;
        });

        // Сохраняем фото, если есть
        const photoArea = document.getElementById('photo-upload-area');
        if (photoArea.style.backgroundImage) {
            userData.photo = photoArea.style.backgroundImage;
        }

        return userData;
    }

    collectSocialLinks() {
        const socialLinks = [];

        // Основная социальная ссылка
        const mainSocialSelect = document.querySelector('.social-select-wrapper select');
        const mainSocialInput = document.querySelector('.social-input-group .input-gray');

        if (mainSocialInput.value) {
            socialLinks.push({
                type: mainSocialSelect.value,
                url: mainSocialInput.value
            });
        }

        // Дополнительные социальные ссылки
        document.querySelectorAll('#additional-social-links .social-input-group').forEach(group => {
            const select = group.querySelector('select');
            const input = group.querySelector('.input-gray');

            if (input.value) {
                socialLinks.push({
                    type: select.value,
                    url: input.value
                });
            }
        });

        return socialLinks;
    }

    async loadUserData() {
        const email = document.getElementById('email').value;
        if (!email) return;

        try {
            const userData = await this.db.getUser(email);
            if (userData) {
                this.populateForm(userData);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    populateForm(userData) {
        // Заполняем основные поля
        document.getElementById('lastname').value = userData.personalInfo.lastName || '';
        document.getElementById('firstname').value = userData.personalInfo.firstName || '';
        document.getElementById('middlename').value = userData.personalInfo.middleName || '';

        if (userData.personalInfo.sex) {
            document.querySelector(`input[name="sex"][value="${userData.personalInfo.sex}"]`).checked = true;
        }

        document.getElementById('phone').value = userData.personalInfo.phone || '';
        document.getElementById('education').value = userData.personalInfo.education || '';
        document.getElementById('about').value = userData.personalInfo.about || '';
        document.getElementById('foreign-lang').checked = userData.personalInfo.foreignLang || false;

        // Заполняем профессию и навыки
        if (userData.profession) {
            document.getElementById('profession-select').value = userData.profession;
            this.createSkillSliders(userData.profession);

            // После создания ползунков заполняем их значения
            setTimeout(() => {
                for (const [skillId, value] of Object.entries(userData.skills)) {
                    const slider = document.querySelector(`.skill-range[data-skill="${skillId}"]`);
                    if (slider) {
                        slider.value = value;
                        slider.nextElementSibling.textContent = `${value}%`;
                    }
                }
            }, 100);
        }

        // Заполняем местоположение
        if (userData.location.country) {
            document.getElementById('country-select').value = userData.location.country;
            document.getElementById('country-select').dispatchEvent(new Event('change'));

            setTimeout(() => {
                if (userData.location.region) {
                    document.getElementById('region-select').value = userData.location.region;
                    document.getElementById('region-select').dispatchEvent(new Event('change'));

                    setTimeout(() => {
                        if (userData.location.city) {
                            document.getElementById('city-select').value = userData.location.city;
                        }
                    }, 100);
                }
            }, 100);
        }

        document.getElementById('address-input').value = userData.location.address || '';
        document.getElementById('birthdate').value = userData.birthdate || '';

        // Заполняем социальные ссылки
        this.populateSocialLinks(userData.socialLinks || []);

        // Загружаем фото
        if (userData.photo) {
            const photoArea = document.getElementById('photo-upload-area');
            photoArea.style.backgroundImage = userData.photo;
            photoArea.classList.add('has-image');
        }
    }

    populateSocialLinks(socialLinks) {
        // Очищаем дополнительные социальные ссылки
        document.getElementById('additional-social-links').innerHTML = '';

        if (socialLinks.length === 0) return;

        // Заполняем первую социальную ссылку
        if (socialLinks[0]) {
            const mainSelect = document.querySelector('.social-select-wrapper select');
            const mainInput = document.querySelector('.social-input-group .input-gray');

            mainSelect.value = socialLinks[0].type;
            mainInput.value = socialLinks[0].url;

            // Обновляем иконку
            this.initSocialSelect(document.querySelector('.social-select-wrapper'));
        }

        // Добавляем дополнительные социальные ссылки
        for (let i = 1; i < socialLinks.length; i++) {
            this.addSocialLinkField();

            // Заполняем добавленное поле
            const addedGroups = document.querySelectorAll('#additional-social-links .social-input-group');
            const lastGroup = addedGroups[addedGroups.length - 1];

            if (lastGroup) {
                const select = lastGroup.querySelector('select');
                const input = lastGroup.querySelector('.input-gray');

                select.value = socialLinks[i].type;
                input.value = socialLinks[i].url;

                // Обновляем иконку
                this.initSocialSelect(lastGroup.querySelector('.social-select-wrapper'));
            }
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Убираем уведомление через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}