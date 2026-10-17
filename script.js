// 画面の部品（HTMLの要素）を取得しておく
const form = document.getElementById('warikan-form');
const totalInput = document.getElementById('total');
const peopleInput = document.getElementById('people');
const errorText = document.getElementById('error');
const perPersonText = document.getElementById('per-person');
const collectTotalText = document.getElementById('collect-total');
const remainderText = document.getElementById('remainder');

// 結果の表示を「-」に戻す
function clearResult() {
  perPersonText.textContent = '-';
  collectTotalText.textContent = '-';
  remainderText.textContent = '-';
}

// 入力をチェックし、問題があればエラー文を返す（問題なければ空文字）
function validate(total, people) {
  if (totalInput.value === '' || peopleInput.value === '') {
    return '合計金額と人数を両方入力してください。';
  }
  if (!Number.isInteger(total) || total < 0) {
    return '合計金額は0以上の整数で入力してください。';
  }
  if (!Number.isInteger(people) || people < 1) {
    return '人数は1以上の整数で入力してください。';
  }
  return '';
}

// 「計算する」ボタンが押されたときの処理
form.addEventListener('submit', function (event) {
  // フォーム送信でページが再読み込みされるのを止める
  event.preventDefault();

  const total = Number(totalInput.value);
  const people = Number(peopleInput.value);

  const message = validate(total, people);
  if (message !== '') {
    errorText.textContent = message;
    clearResult();
    return;
  }
  errorText.textContent = '';

  // 1人あたりを100円単位で切り上げる（例：3334円 → 3400円）
  const perPerson = Math.ceil(total / people / 100) * 100;
  const collectTotal = perPerson * people;
  const remainder = collectTotal - total;

  // toLocaleString() で「10,000」のようにカンマ区切りにする
  perPersonText.textContent = perPerson.toLocaleString();
  collectTotalText.textContent = collectTotal.toLocaleString();
  remainderText.textContent = remainder.toLocaleString();
});
