// 브라우저의 기본 alert 기능을 showMessage로 덮어씌웁니다.
window.alert = function(text) {
    if (typeof showMessage === 'function') {
        showMessage(text);
    } else {
        // 혹시 showMessage가 로드 안 됐을 때를 대비한 백업
        console.log("Custom alert:", text);
    }
};


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
 ========================= */

    const deleteConfirmOverlay = document.getElementById("deleteConfirmOverlay");
    const deleteSuccessOverlay = document.getElementById("deleteSuccessOverlay");
    const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
    const deleteCancelBtn = document.getElementById("deleteCancelBtn");
    const deleteSuccessOkBtn = document.getElementById("deleteSuccessOkBtn");

    let selectedInquiryId = null;

// 삭제 버튼 클릭 감지
    function handleDeleteClick(e) {
        if (!e.target.classList.contains("btn-delete")) return;

        const item = e.target.closest(".inquiry-item");
        selectedInquiryId = item.dataset.id;

        //삭제 확인 모달 표시
        deleteConfirmOverlay?.classList.add("visible");
    }

// 이벤트 중복 방지
    listSection?.removeEventListener("click", handleDeleteClick);
    listSection?.addEventListener("click", handleDeleteClick);

// 취소 버튼
    deleteCancelBtn?.addEventListener("click", () => {
        deleteConfirmOverlay.classList.remove("visible");
        selectedInquiryId = null;
    });

// 확인 버튼
    deleteConfirmBtn?.addEventListener("click", () => {
        if (!selectedInquiryId) return;

        fetch(`/cs/inquiry/delete/${selectedInquiryId}`, {
            method: "DELETE"
        })
            .then(res => {
                if (!res.ok) throw new Error("삭제 실패");
                return res.text();
            })
            .then(() => {
                deleteConfirmOverlay.classList.remove("visible");
                deleteSuccessOverlay?.classList.add("visible");
            })
            .catch(err => {
                console.error(err);
                alert("삭제 중 오류가 발생했습니다.");
            });
    });

// 삭제 완료 확인 버튼
    deleteSuccessOkBtn?.addEventListener("click", () => {
        deleteSuccessOverlay.classList.remove("visible");
        location.reload();
    });
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


    /* =========================
       로그인 성공 알림 (커스텀 모달)
    ========================== */
    const urlParams = new URLSearchParams(window.location.search);
    const loginStatus = urlParams.get('status'); // 컨트롤러에서 보내는 파라미터명 확인 필요

    // 예: /cs?status=admin_success 로 접속했을 때
    if (loginStatus === 'admin_success') {
        // 기존의 alert("관리자 계정으로...") 대신 showMessage 사용
        if (typeof showMessage === 'function') {
            showMessage("관리자 계정으로 로그인 되었습니다.", () => {
                // 확인 버튼 누르면 URL의 파라미터를 지워줍니다 (새로고침 시 또 뜨지 않게)
                window.history.replaceState({}, document.title, window.location.pathname);
            });
        }
    }
});



document.addEventListener("DOMContentLoaded", () => {
    // 관리자 리스트 아코디언 제어
    const adminDashboard = document.querySelector(".admin-dashboard");

    adminDashboard?.addEventListener("click", (e) => {
        // 요약 줄을 클릭했을 때만 작동
        const summaryRow = e.target.closest(".admin-summary-row");
        if (summaryRow) {
            const item = summaryRow.parentElement;

            item.classList.toggle("active");
        }
    });
});

/**
 * 관리자 답변 등록 로직
 */
function submitAnswer(inquiryId) {
    const answerTextArea = document.getElementById(`answerText-${inquiryId}`);
    const answerContent = answerTextArea?.value.trim();

    if (!answerContent) {
        alert("답변 내용을 입력해주세요.");
        return;
    }

    // 1. 서버에 보낼 데이터 준비
    const requestData = {
        id: parseInt(inquiryId),
        answer: answerContent
    };

    // 2. 서버 전송
    fetch("/cs/inquiry/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
    })
        .then(async response => {
            if (!response.ok) throw new Error(await response.text());
            return response.text();
        })
        .then(data => {
            if (data === "SUCCESS") {
                // 3. 성공 시 "답변이 등록되었습니다" 창 띄우기
                const successOverlay = document.getElementById('replySuccessOverlay');
                const successOkBtn = document.getElementById('replySuccessOkBtn');

                if (successOverlay) {
                    successOverlay.classList.add('visible');

                    // 확인 버튼 클릭 시 페이지 새로고침
                    successOkBtn.onclick = () => {
                        location.reload();
                    };
                } else {
                    // 만약 오버레이를 못 찾으면 기본 알림이라도 띄움
                    alert("답변이 등록되었습니다.");
                    location.reload();
                }
            }
        })
        .catch(error => {
            console.error(" 에러:", error);
            alert("등록 중 오류가 발생했습니다.");
        });
}