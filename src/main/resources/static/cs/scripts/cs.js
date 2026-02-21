document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       1. 문의 작성 모달
    ========================== */

    const openBtn = document.getElementById("openInquiryBtn");
    const modal = document.getElementById("inquiryModal");
    const closeBtn = document.getElementById("modalCloseBtn");
    const cancelBtn = document.getElementById("modalCancelBtn");

    if (openBtn && modal) {
        openBtn.addEventListener("click", () => {
            modal.classList.add("active");
        });
    }

    const closeModal = () => modal.classList.remove("active");

    closeBtn?.addEventListener("click", closeModal);
    cancelBtn?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });


    /* =========================
       2. 문의 리스트 패널
    ========================== */

    const listBtn = document.getElementById("openInquiryListBtn");
    // 버튼에 id 주는 걸 추천
    const listSection = document.getElementById("inquiryListSection");
    const inquiryCloseBtn = document.getElementById("closeInquiryList");

    if (listBtn && listSection) {
        listBtn.addEventListener("click", () => {
            listSection.classList.add("active");
        });
    }

    inquiryCloseBtn?.addEventListener("click", () => {
        listSection.classList.remove("active");
    });


    /* =========================
       3. 문의 아코디언 토글
    ========================== */

    listSection?.addEventListener("click", (e) => {
        const item = e.target.closest(".inquiry-item");
        if (!item) return;

        item.classList.toggle("active");
    });

    /* =========================
          4. 문의 삭제 버튼
       ========================== */
    // 기존 이벤트 제거 후 다시 등록
    function handleDeleteClick(e) {
        if (!e.target.classList.contains("btn-delete")) return;

        const item = e.target.closest(".inquiry-item");
        const inquiryId = item.dataset.id;

        if (confirm('정말 삭제하시겠습니까?')) {
            fetch(`/cs/inquiry/delete/${inquiryId}`, { method: 'POST' })
                .then(() => window.location.reload())
                .catch(() => alert('삭제 실패'));
        }
    }

// 이벤트 중복 방지
    listSection?.removeEventListener("click", handleDeleteClick);
    listSection?.addEventListener("click", handleDeleteClick);
    /* =========================
   5. 문의 작성 검증
========================= */

    const form = document.getElementById("inquiryForm");
    const titleInput = document.getElementById("inquiryTitle");
    const contentInput = document.getElementById("inquiryContent");

    form?.addEventListener("submit", (e) => {

        const title = titleInput?.value.trim() || "";
        const content = contentInput?.value.trim() || "";

        // 제목 검사
        if (title.length < 5 || title.length > 100) {
            alert("제목은 5자 이상 100자 이하로 입력해주세요.");
            e.preventDefault();
            titleInput?.focus();
            return;
        }

        // 내용 검사
        if (content.length < 10 || content.length > 2000) {
            alert("내용은 10자 이상 2000자 이하로 입력해주세요.");
            e.preventDefault();
            contentInput?.focus();
            return;
        }
    });


});


