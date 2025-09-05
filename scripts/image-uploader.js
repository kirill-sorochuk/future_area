class ImageUploader {
    constructor() {
        this.photoInput = document.getElementById('photo-upload-input');
        this.photoArea = document.getElementById('photo-upload-area');
        this.cropModal = document.getElementById('crop-modal');
        this.cropImage = document.getElementById('crop-image');
        this.cropConfirm = document.getElementById('crop-confirm');
        this.rotateLeft = document.getElementById('rotate-left');
        this.rotateRight = document.getElementById('rotate-right');
        this.closeCropModal = document.getElementById('close-crop-modal');

        this.cropper = null;
        this.currentRotation = 0;
        this.currentImageFile = null;

        this.init();
    }

    init() {
        if (this.photoInput) {
            this.photoInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        if (this.closeCropModal) {
            this.closeCropModal.addEventListener('click', () => this.closeModal());
        }

        if (this.cropConfirm) {
            this.cropConfirm.addEventListener('click', () => this.cropImageHandler());
        }

        if (this.rotateLeft) {
            this.rotateLeft.addEventListener('click', () => this.rotate(-90));
        }

        if (this.rotateRight) {
            this.rotateRight.addEventListener('click', () => this.rotate(90));
        }

        // Drag and drop для области загрузки
        this.setupDragAndDrop();

        // Загружаем текущее фото если есть
        this.loadCurrentPhoto();
    }

    loadCurrentPhoto() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.photo) {
            this.setProfileImage(currentUser.photo);
        }
    }


    setupDragAndDrop() {
        if (!this.photoArea) return;

        this.photoArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.photoArea.classList.add('dragover');
        });

        this.photoArea.addEventListener('dragleave', () => {
            this.photoArea.classList.remove('dragover');
        });

        this.photoArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.photoArea.classList.remove('dragover');

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                this.currentImageFile = e.dataTransfer.files[0];
                this.handleImageUpload({ target: { files: [this.currentImageFile] } });
            }
        });

        // Клик по области для выбора файла
        this.photoArea.addEventListener('click', () => {
            if (this.photoInput) {
                this.photoInput.click();
            }
        });
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            authManager.showModal('Ошибка', 'Пожалуйста, выберите изображение', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            authManager.showModal('Ошибка', 'Размер файла не должен превышать 5MB', 'error');
            return;
        }

        this.currentImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showCropModal(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    showCropModal(imageSrc) {
        if (!this.cropModal || !this.cropImage) return;

        this.cropImage.src = imageSrc;
        this.cropModal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Инициализируем cropper после загрузки изображения
        this.cropImage.onload = () => {
            if (this.cropper) {
                this.cropper.destroy();
            }

            this.cropper = new Cropper(this.cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                guides: true,
                background: false,
                autoCropArea: 0.8,
                responsive: true,
                restore: false,
                checkCrossOrigin: false
            });

            this.currentRotation = 0;
        };
    }

    closeModal() {
        if (!this.cropModal) return;

        this.cropModal.style.display = 'none';
        document.body.style.overflow = '';

        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }

        // Очищаем input
        if (this.photoInput) {
            this.photoInput.value = '';
        }
    }

    cropImageHandler() {
        if (!this.cropper) return;

        const canvas = this.cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (!canvas) {
            authManager.showModal('Ошибка', 'Не удалось обработать изображение', 'error');
            return;
        }

        const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
        this.setProfileImage(croppedImage);
        this.saveImageToStorage(croppedImage);
        this.closeModal();

        authManager.showModal('Успех', 'Фотография успешно загружена', 'success');
    }

    rotate(degrees) {
        if (!this.cropper) return;

        this.currentRotation += degrees;
        this.cropper.rotateTo(this.currentRotation);
    }

    setProfileImage(imageData) {
        if (!this.photoArea) return;

        // Создаем превью в форме загрузки
        this.photoArea.innerHTML = `
            <div class="upload-content">
                <img src="${imageData}" alt="Превью фото" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                <div class="upload-text">Фото загружено</div>
                <div class="upload-subtext">Нажмите для изменения</div>
            </div>
            <input type="file" accept="image/*" id="photo-upload-input">
        `;

        // Переинициализируем обработчики
        this.photoInput = document.getElementById('photo-upload-input');
        if (this.photoInput) {
            this.photoInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Сохраняем фото в данные пользователя
        this.saveImageToStorage(imageData);
    }

    saveImageToStorage(imageData) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
        currentUser.photo = imageData;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Также обновляем в общем списке пользователей
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === currentUser.email);

        if (userIndex !== -1) {
            users[userIndex].photo = imageData;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    loadProfileImage() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.photo && this.photoArea) {
            this.photoArea.innerHTML = `
                <div class="upload-content">
                    <img src="${currentUser.photo}" alt="Фото профиля" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                    <div class="upload-text">Фото загружено</div>
                    <div class="upload-subtext">Нажмите для изменения</div>
                </div>
                <input type="file" accept="image/*" id="photo-upload-input">
            `;

            this.photoInput = document.getElementById('photo-upload-input');
            if (this.photoInput) {
                this.photoInput.addEventListener('change', (e) => this.handleImageUpload(e));
            }
        }
    }
}