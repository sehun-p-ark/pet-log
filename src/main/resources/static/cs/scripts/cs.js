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


document.addEventListener("DOMContentLoaded", () => {
    // 관리자 리스트 아코디언 제어
    const adminDashboard = document.querySelector(".admin-dashboard");

    adminDashboard?.addEventListener("click", (e) => {
        // 요약 줄을 클릭했을 때만 작동
        const summaryRow = e.target.closest(".admin-summary-row");
        if (summaryRow) {
            const item = summaryRow.parentElement;

            // 다른 게 열려있으면 닫고 싶을 때 (선택사항)
            // document.querySelectorAll('.admin-inquiry-item').forEach(el => {
            //    if(el !== item) el.classList.remove('active');
            // });

            item.classList.toggle("active");
        }
    });
});

/**
 * 관리자 답변 등록 함수
 * @param {number} inquiryId - 문의글 ID
 */
function submitAnswer(inquiryId) {
    const answerTextArea = document.getElementById(`answerText-${inquiryId}`);
    const answerContent = answerTextArea?.value.trim();

    if (!answerContent) {
        alert("답변 내용을 입력해주세요.");
        return;
    }

    // [디버그 1] 전송 전 데이터 확인
    const requestData = {
        id: parseInt(inquiryId), // 명시적으로 숫자로 변환
        answer: answerContent
    };
    console.log("🚀 서버로 보낼 데이터:", requestData);

    if (!confirm("답변을 등록하시겠습니까?")) return;

    fetch("/cs/inquiry/answer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" // [디버그 2] 헤더 설정 확인
        },
        body: JSON.stringify(requestData)
    })
        .then(async response => {
            // [디버그 3] 서버 응답 상태 및 상세 에러 메시지 확인
            if (!response.ok) {
                const errorText = await response.text(); // 서버가 보낸 에러 메세지 읽기
                console.error(`❌ 서버 에러 발생 (상태 코드: ${response.status})`);
                console.error("❌ 에러 내용:", errorText);
                throw new Error(`서버가 400 에러를 반환했습니다: ${errorText}`);
            }
            return response.text();
        })
        .then(data => {
            console.log("✅ 서버 응답 데이터:", data);
            if (data === "SUCCESS") {
                alert("답변이 성공적으로 등록되었습니다.");
                location.reload();
            }
        })
        .catch(error => {
            console.error("🔥 통신 에러 상세:", error);
            alert("등록 중 오류가 발생했습니다. 콘솔창(F12)을 확인해주세요.");
        });
}