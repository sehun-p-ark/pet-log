document.addEventListener('DOMContentLoaded', () => {

    /* ==============================
        기본 DOM
    ============================== */

    const $thumbnail = document.querySelector('.thumbnail');
    const $basicContent = $thumbnail.querySelector(':scope > .new-content');
    const $labelFileInput = $basicContent.querySelector('input[type=file]');
    const $image = $thumbnail.querySelector(':scope > img');
    const $video = $thumbnail.querySelector(':scope > video');
    const $preview = $thumbnail.querySelector(':scope > .preview');
    const $liNewContent = $preview.querySelector(':scope > .new-content');
    const $liFileInput = $liNewContent.querySelector('input[type=file]');
    const $submitButton = document.querySelector('.submit-btn');

    const mode = document.body.dataset.mode;
    const feedId = document.body.dataset.feedId;

    const selectedMedia = [];

    /* ==============================
        수정 모드 기존 데이터 세팅
    ============================== */

    if (mode === "edit" && Array.isArray(existingMedia) && existingMedia.length > 0) {

        existingMedia
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .forEach(media => {

                selectedMedia.push({
                    isNew: false,
                    mediaId: media.id,
                    file: null,
                    type: media.mediaType === "VIDEO" ? "video" : "image",
                    src: media.mediaUrl
                });

                addExistingPreview(media);
            });

        setMainMedia(selectedMedia[0]);
    }

    /* ==============================
        파일 추가 이벤트
    ============================== */

    $labelFileInput.addEventListener('change', addFile);
    $liFileInput.addEventListener('change', addFile);

    function addFile(e) {

        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image') && !file.type.startsWith('video')) {
            alert('이미지 또는 동영상만 업로드 가능합니다.');
            e.target.value = '';
            return;
        }

        const blobURL = URL.createObjectURL(file);
        const type = file.type.startsWith('image') ? 'image' : 'video';

        const mediaObj = {
            isNew: true,
            mediaId: null,
            file: file,
            type: type,
            src: blobURL
        };

        selectedMedia.push(mediaObj);

        addPreviewItem(mediaObj);
        setMainMedia(mediaObj);

        e.target.value = '';
    }

    /* ==============================
        preview 클릭 이벤트
    ============================== */

    $preview.addEventListener('click', (e) => {

        const cancelBtn = e.target.closest('.cancel-btn');

        /* ---- 삭제 ---- */

        if (cancelBtn) {

            const $content = cancelBtn.closest('.content');
            const src = $content.dataset.src;

            const index = selectedMedia.findIndex(m => m.src === src);
            if (index !== -1) selectedMedia.splice(index, 1);

            if (src.startsWith('blob:')) {
                URL.revokeObjectURL(src);
            }

            $content.remove();

            if (selectedMedia.length === 0) {
                resetMainMedia();
            } else {
                setMainMedia(selectedMedia[0]);
            }

            return;
        }

        /* ---- 클릭해서 메인 변경 ---- */

        const $content = e.target.closest('.content');
        if (!$content) return;

        const src = $content.dataset.src;
        const media = selectedMedia.find(m => m.src === src);
        if (!media) return;

        setMainMedia(media);
    });

    /* ==============================
        제출 이벤트
    ============================== */

    $submitButton.addEventListener('click', (e) => {
        e.preventDefault();

        const title = document.querySelector('input[name="title"]').value.trim();
        const description = document.querySelector('textarea[name="description"]').value.trim();

        if (selectedMedia.length === 0) {
            showMessage("이미지 또는 동영상을 최소 1개 업로드해주세요.");
            return;
        }
        if (!title || title.length === 0) {
            showMessage("제목을 입력해주세요.");
            return;
        }
        if (title.length > 50) {
            showMessage("제목의 최대길이는 50자입니다.")
        }
        if (!description || description.length === 0) {
            showMessage("내용을 입력해주세요.");
            return;
        }
        if (description.length > 1000) {
            showMessage("내용의 최대길이는 1000자입니다.")
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        selectedMedia.forEach((media, index) => {

            if (media.isNew) {
                formData.append('files', media.file);
                formData.append('newOrders', index.toString());
            } else {
                formData.append('keepMediaIds', media.mediaId);
                formData.append('keepOrders', index.toString());
            }
        });

        const xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;

            if (xhr.status < 200 || xhr.status >= 400) {
                alert("오류가 발생했습니다.");
                return;
            }

            const response = JSON.parse(xhr.responseText);

            switch (response.result) {
                case "LOGIN_REQUIRED":
                    alert("로그인이 필요합니다.");
                    break;
                case "SUCCESS":
                    window.location.href = "/feed/explore";
                    break;
                default:
                    alert("알 수 없는 오류가 발생했습니다.");
            }
        };

        if (mode === "create") {
            xhr.open('POST', '/api/feed');
        } else {
            xhr.open('PUT', `/api/feed/${feedId}`);
        }

        xhr.send(formData);
    });

    /* ==============================
        유틸 함수
    ============================== */

    function addPreviewItem(media) {

        const $li = document.createElement('li');
        $li.classList.add('content');
        $li.dataset.src = media.src;
        $li.dataset.type = media.type;

        if (media.type === 'image') {
            $li.style.backgroundImage = `url("${media.src}")`;
        } else {
            $li.style.backgroundImage = `url("${media.src}")`;
        }

        const $button = document.createElement('button');
        $button.type = 'button';
        $button.className = 'cancel-btn';
        $button.innerHTML = '×';

        $li.appendChild($button);
        $preview.insertBefore($li, $liNewContent);
        $preview.classList.add('active');
    }

    function addExistingPreview(media) {

        const mediaObj = {
            isNew: false,
            mediaId: media.id,
            file: null,
            type: media.mediaType === "VIDEO" ? "video" : "image",
            src: media.mediaUrl
        };

        addPreviewItem(mediaObj);
    }

    function setMainMedia(media) {

        $basicContent.style.display = 'none';
        $preview.classList.add('active');

        if (media.type === 'image') {
            $image.src = media.src;
            $image.style.display = 'block';
            $video.style.display = 'none';
        } else {
            $video.src = media.src;
            $video.style.display = 'block';
            $image.style.display = 'none';
        }
    }

    function resetMainMedia() {
        $basicContent.style.display = 'flex';
        $preview.classList.remove('active');
        $image.src = '';
        $video.src = '';
        $image.style.display = 'none';
        $video.style.display = 'none';
    }

});