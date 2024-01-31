import { main } from "/public/js/main.js";
import { logout } from "/public/js/logout.js";

// 가격 문자열에서 숫자만 반환하는 함수
function getPriceNumber(str) {
  return Number(str.replace(/,/g, "").slice(0, -1));
}

const orderList = document.querySelector(".orderList");
const booksPrice = document.querySelector(".booksPrice");
const deliveryFee = document.querySelector(".deliveryFee");
const totalCost = document.querySelector(".totalCost");

const userDeliveryInfo = document.querySelectorAll(".user_delivery_info");
const [
  nameInput,
  phoneNumberInput,
  postalCodeInput,
  addressInput,
  detailAddressInput,
] = userDeliveryInfo;

// 사용자 기본정보 출력
let email;
async function loadUserData() {
  try {
    const response = await fetch("/user", {
      method: "GET",
    });
    if (response.ok) {
      const data = await response.json();
      nameInput.value = data.name;
      phoneNumberInput.value = data.phone;
      postalCodeInput.value = data.postalCode;
      addressInput.value = data.address;
      detailAddressInput.value = data.detailAddress;
      email = data.email;
    } else {
      alert("로그인을 해주세요.");
      logout();
      throw new Error("사용자를 찾을 수 없습니다.");
    }
  } catch (error) {
    console.log(error.message);
  }
}
loadUserData();

// 로컬스토리지에서 purchase 데이터 렌더
let bookPriceSum = 0;
let purchaseData = JSON.parse(localStorage.getItem("purchase"));
if (purchaseData.length !== 0) {
  purchaseData.forEach((data) => {
    const { title, author, isbn, price, imagePath, amount } = data;

    orderList.innerHTML += `<div class="item">
      <a class="book-img" href="/book-detail/?isbn=${isbn}">
        <img src="${imagePath}" class="book-img" alt="${title}"/>
      </a>
      <div class="book__title__price">
        <div class="book-title">
          <a class="book-link" href="/book-detail/?isbn=${isbn}">${title}</a>
          <div class="author">${author}</div>
        </div>
        <div class="amount">총 ${amount}권</div>
        <div class="item-price">${(price * amount).toLocaleString()}원</div>
      </div>
    </div>`;
    bookPriceSum += price * amount;
  });
}

// 배송비 계산
function setDeliveryFee() {
  if (getPriceNumber(booksPrice.innerText) >= 50000) {
    deliveryFee.innerText = "0원";
  } else {
    deliveryFee.innerText = "3,000원";
  }
}
setDeliveryFee();

// 총 결제 금액 계산
function setTotalCost() {
  const totalCostNum =
    getPriceNumber(booksPrice.innerText) +
    getPriceNumber(deliveryFee.innerText);
  totalCost.innerText = `${totalCostNum.toLocaleString()}원`;
}
setTotalCost();

// 요청사항
const customRequestContainer = document.querySelector(
  ".customRequestContainer"
);
const customRequestInput = document.querySelector(".customRequest");
const requestSelectBox = document.querySelector("#request__Select__Box");

// "직접 입력" 선택 시 input칸 보이게 함
function handleRequestChange(e) {
  const type = e.target.value;

  if (type === "5") {
    console.log("직접 입력 선택됨");
    customRequestContainer.style.display = "flex";
    customRequestInput.focus();
  } else {
    console.log("직접 입력 선택 해제됨");
    customRequestContainer.style.display = "none";
  }
}
requestSelectBox.addEventListener("change", handleRequestChange);

// 상품 가격, 배송비, 총 결제 금액 출력
booksPrice.innerText = `${bookPriceSum.toLocaleString()}원`;
if (bookPriceSum >= 50000) {
  deliveryFee.innerText = "0원";
  totalCost.innerText = booksPrice.innerText;
} else {
  deliveryFee.innerText = "3,000원";
  totalCost.innerText = `${(bookPriceSum + 3000).toLocaleString()}원`;
}

const requestOption = {
  1: "배송 전 연락바랍니다.",
  2: "부재 시 경비실에 맡겨주세요.",
  3: "부재 시 문 앞에 놓아주세요.",
  4: "부재 시 택배함에 넣어주세요.",
  5: "직접 입력",
};

// 결제하기 버튼 클릭 이벤트
const payBtn = document.querySelector(".paymentButton button");
payBtn.addEventListener("click", async () => {
  // 정보 입력
  if (
    !nameInput.value.trim() ||
    !phoneNumberInput.value ||
    !postalCodeInput.value ||
    !addressInput.value
  ) {
    return alert("배송지 정보를 모두 입력해주세요");
  }
  // 숫자가 아닌 다른값이 들어가 있을 경우
  if (typeof Number(phoneNumberInput.value) !== "number") {
    return alert("휴대폰번호를 잘못 입력하셨습니다. 숫자만 입력하세요.");
  }
  // 길이가 너무 짧은 경우
  if (phoneNumberInput.length < 10) {
    return alert("휴대폰번호를 잘못 입력하셨습니다. 다시 입력해주세요.");
  }
  const requestType = requestSelectBox.value;
  let request;
  // 요청사항의 종류에 따라 request 문구가 달라짐
  if (requestType === "0") {
    request = "요청사항 없음.";
  } else if (requestType === "5") {
    console.log("직접 입력 요청 사항:", customRequestInput.value);
    request = customRequestInput.value;
  } else {
    console.log("선택한 요청 사항:", requestOption[requestType]);
    request = requestOption[requestType];
  }

  console.log("request 변수 값:", request);

  let orderArr = [];
  for (let i = 0; i < purchaseData.length; i++) {
    const ISBN = purchaseData[i].isbn;
    const amount = purchaseData[i].amount;
    orderArr.push({ ISBN: ISBN, amount: amount });
  }

  const requestData = {
    recipientName: nameInput.value,
    postalCode: postalCodeInput.value,
    address: addressInput.value,
    addressDetail: detailAddressInput.value,
    contact: phoneNumberInput.value,
    deliveryRequest: request,
    orderItems: orderArr,
    deliveryFee: getPriceNumber(deliveryFee.innerText),
    totalPrice: getPriceNumber(totalCost.innerText),
  };

  console.log("fetch 요청 데이터:", requestData);

  try {
    const response = await fetch("/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (response.status === 204) {
      alert("주문에 성공했습니다.");
      localStorage.removeItem("purchase");
      localStorage.removeItem("cart");
      location.href = "/order-complete";
    } else {
      throw new Error("결제에 실패했습니다.");
    }
  } catch (error) {
    console.log(error.message);
    alert("결제에 실패했습니다. 다시 시도해주세요.");
  }
});

main();
