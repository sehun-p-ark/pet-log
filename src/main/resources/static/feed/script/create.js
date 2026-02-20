const $thumbnail = document.querySelector('.thumbnail');
const $basicContent = $thumbnail.querySelector(':scope > .new-content');
const $labelFileInput = $basicContent.querySelector(':scope > input[type=file]');
const $image = $thumbnail.querySelector(':scope > img');
const $video = $thumbnail.querySelector(':scope > video');
const $preview = $thumbnail.querySelector(':scope > .preview');
const $liNewContent = $preview.querySelector(':scope > .new-content');
const $liFileInput = $liNewContent.querySelector(':scope > label > input[type=file]');
const $submitButton = document. querySelector('.submit-btn');

const selectedMedia = [];
let orderCounter = 0;

// 파일 추가 이벤트
$labelFileInput.addEventListener('change', e => {addFile(e)});
$liFileInput.addEventListener('change', e => {addFile(e)});

// 미리보기 클릭 이벤트 (1. 삭제 버튼 클릭 / 2. 이미지 클릭)
$preview.addEventListener('click', (e) => {
    const cancelBtn = e.target.closest(".cancel-btn");
    if (cancelBtn) { // 삭제 버튼을 눌렀을 떄
        const $content = cancelBtn.closest(".content"); // 삭제할 미디어
        if (!$content) return;
        const removeURL = $content.dataset.src; // 삭제할 미디어의 URL
        if (!removeURL) return;

        const index = selectedMedia.findIndex(media => media.src === removeURL);
        if (index !== -1) { // 삭제할 media를 찾은 경우
            selectedMedia.splice(index, 1);
        }

        URL.revokeObjectURL(removeURL); // 미리보기 url 삭제
        $content.remove(); // 미리보기 삭제

        // 삭제하고 남은거 가져오기
        const $remainContent = $preview.querySelectorAll(':scope > .content');

        const isCurrentImage = $image.style.display === 'block' && $image.src === removeURL;
        const isCurrentVideo = $video.style.display === 'block' && $video.src === removeURL;

        if ($remainContent.length === 0) { // preview에 남은 이미지가 없으면
            $preview.classList.remove('active');
            $basicContent.style.display = 'flex';
            $image.src = '';
            $image.style.display = 'none';
            $video.src = '';
            $video.style.display = 'none';
        }

        if ((isCurrentImage || isCurrentVideo) && $remainContent.length > 0) { // 이미지가 남아있고, 메인 이미지 = 삭제 버튼 누른 이미지
            const nextLi = $remainContent[0]
            const nextSrc = nextLi.dataset.src;
            const nextType = nextLi.dataset.type;

            if (nextType === 'img') {
                $image.src = nextSrc;
                $image.style.display = 'block';
                $video.style.display = 'none';
            } else if (nextType === 'video') {
                $video.src = nextSrc;
                $image.style.display = 'none';
                $video.style.display = 'block';
            }
        }
    }
    else if (!cancelBtn) { // preview 사진 클릭 시
        const $content = e.target.closest(".content");
        if (!$content) return;

        const src = $content.dataset.src;
        const type = $content.dataset.type;

        if (type === 'img') { // 클릭한 사진으로 바꿔주기
            $image.src = src;
            $image.style.display = 'block';
            $video.style.display = 'none';
        }
        else if (type === 'video') { // 클릭한 동영상으로 바줘주기
            $video.src = src;
            $image.style.display = 'none';
            $video.style.display = 'block';
        }
    }
});

// 제출하기 버튼 클릭 이벤트
$submitButton.addEventListener('click', (e) => {
    e.preventDefault();

    const $title = document.querySelector('input[name="title"]').value.trim();
    const $description = document.querySelector('textarea[name="description"]').value.trim();

    if (selectedMedia.length === 0) {
        alert("이미지 또는 동영상을 최소 1개 업로드해주세요.");
        return;
    }

    if (!$title) {
        alert("제목을 입력해주세요");
        return;
    }

    if (!$description) {
        alert("내용을 입력해주세요.")
        return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    selectedMedia.forEach((media, index) => {
        formData.append('files', media.file);
        formData.append('types', media.type);
        formData.append('orders', index.toString());
    });
    formData.append('title', $title);
    formData.append('description', $description);
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return;
        }
        if (xhr.status < 200 || xhr.status >= 400) {
            showMessage('박살남');
            return;
        }
        const response = JSON.parse(xhr.responseText);
        switch (response.result) {
            case "result" : showMessage('로그인을 먼저 진행해주세요');
            break;
            case "FAILURE": showMessage('박살남');
            break;
            case "SUCCESS": showMessage('성공함');
            break;
        }
    };
    xhr.open('POST', '/api/feed');
    xhr.send(formData);
});

/*************************************************************************************/
// 파일 추가 핸들러 함수
function addFile(e) {
    const file = e.target.files[0]; // 파일 한개 가져오기
    if (!file) return;

    if (!file.type.startsWith('image') && !file.type.startsWith('video')) {
        alert('이미지 또는 동영상 파일만 업로드할 수 있습니다.');
        e.target.value = '';
        return;
    }

    const blobURL = URL.createObjectURL(file); // 임의로 URL을 만듦
    const type = file.type.startsWith('image') ? 'img' : 'video';

    selectedMedia.push({ // 선택한 파일, 타입, 순서를 저장함
        file,
        type,
        src: blobURL // 어떤 파일인지 식별하기 위함
    });

    if (type === 'img') {
        $image.src = blobURL;
        $basicContent.style.display = 'none';
        $image.style.display = 'block';
        $video.style.display = 'none';
        $preview.classList.add('active');
    } else if (type === 'video') {
        $video.src = blobURL;
        $basicContent.style.display = 'none';
        $image.style.display = 'none';
        $video.style.display = 'block'
        $preview.classList.add('active');
    }


    const $previewItem = createLi(blobURL, type);

    $preview.classList.add('active');
    $preview.appendChild($previewItem);

    e.target.value = '';
}

// preview 생성 함수
function createLi(blobURL, type) {
    const $content = document.createElement('li');
    $content.classList.add('content');
    $content.dataset.src = blobURL;
    $content.dataset.type = type;

    if (type === 'img') {
        $content.style.backgroundImage = `url("${blobURL}")`;
    }
    else if (type === 'video') {
        createVideoThumbnail(blobURL, $content);
    }

    const $button = document.createElement('button');
    $button.type = 'button';
    $button.className = 'cancel-btn';

    const svgNs = "http://www.w3.org/2000/svg"
    const $svg = document.createElementNS(svgNs, "svg");
    $svg.setAttribute('width', '16');
    $svg.setAttribute('height', '16');
    $svg.setAttribute('fill', 'currentColor');
    $svg.setAttribute('viewBox', '0 0 16 16');
    $svg.classList.add('bi', 'cancel');

    const $path1 = document.createElementNS(svgNs, "path");
    $path1.setAttribute('d', 'M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353zM5.1 1 1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1z');
    const $path2 = document.createElementNS(svgNs, "path");
    $path2.setAttribute('d', 'M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708');

    $svg.appendChild($path1);
    $svg.appendChild($path2);
    $button.appendChild($svg);
    $content.appendChild($button);

    return $content;
}

// 비디오 썸네일 만들기 함수
function createVideoThumbnail(videoURL, li) {
    const video = document.createElement('video');
    video.src = videoURL;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    video.addEventListener('loadeddata', () => {
        video.currentTime = Math.min(1, video.duration / 2);
    }, {once: true});

    video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            const thumbnailUrl = URL.createObjectURL(blob);
            li.style.backgroundImage = `url("${thumbnailUrl}")`;
        }, 'image/jpeg', 0.8); // jpeg, 80% 품질로

        canvas.remove();
        video.remove();
    }, {once: true});
}