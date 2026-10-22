// 画面の部品（HTMLの要素）を取得しておく
const form = document.getElementById('warikan-form');
const totalInput = document.getElementById('total');
const errorText = document.getElementById('error');
const resultBody = document.getElementById('result-body');
const collectTotalText = document.getElementById('collect-total');
const remainderText = document.getElementById('remainder');

// 立場の一覧。key は HTML の id の頭の部分（例：senior → senior-count）
const roles = [
  { key: 'senior', label: '先輩' },
  { key: 'peer', label: '同期' },
  { key: 'junior', label: '後輩' },
];

// 立場ごとに、人数・割合の入力欄と割合の表示欄を取得しておく
roles.forEach(function (role) {
  role.countInput = document.getElementById(role.key + '-count');
  role.rateInput = document.getElementById(role.key + '-rate');
  role.rateText = document.getElementById(role.key + '-rate-value');
});

// 「計算する」を1回押したかどうか（押した後は入力を変えるたびに自動で計算する）
let hasCalculated = false;

// 割合を「1.0」のように小数1桁の文字にする
function formatRate(rate) {
  return rate.toFixed(1);
}

// スライダーの横の数字を、今のスライダーの値に合わせる
function updateRateTexts() {
  roles.forEach(function (role) {
    role.rateText.textContent = formatRate(Number(role.rateInput.value));
  });
}

// 選ばれている端数の単位（1・10・100 円）を数値で返す
function getUnit() {
  return Number(form.querySelector('input[name="unit"]:checked').value);
}

// 表に1行追加する（cells は各マスに入れる文字の配列）
function addRow(cells) {
  const tr = document.createElement('tr');
  cells.forEach(function (text) {
    const td = document.createElement('td');
    td.textContent = text;
    tr.appendChild(td);
  });
  resultBody.appendChild(tr);
}

// 結果の表示を「-」に戻す
function clearResult() {
  resultBody.textContent = '';
  roles.forEach(function (role) {
    addRow([role.label, '-', '-', '-', '-']);
  });
  collectTotalText.textContent = '-';
  remainderText.textContent = '-';
}

// 入力をチェックし、問題があればエラー文を返す（問題なければ空文字）
function validate(total, counts) {
  if (totalInput.value === '') {
    return '合計金額を入力してください。';
  }
  if (!Number.isInteger(total) || total < 0) {
    return '合計金額は0以上の整数で入力してください。';
  }
  for (const count of counts) {
    if (!Number.isInteger(count) || count < 0) {
      return '人数は0以上の整数で入力してください。';
    }
  }
  const peopleSum = counts.reduce(function (sum, count) {
    return sum + count;
  }, 0);
  if (peopleSum === 0) {
    return '人数を1人以上入力してください。';
  }
  return '';
}

// 立場ごとの1人あたり・小計と、集める合計・余りを計算する
function calculate(total, counts) {
  // 割合を10倍した整数にする（例：1.5 → 15）。小数の計算誤差で切り上げがずれるのを防ぐため
  const rates10 = roles.map(function (role) {
    return Math.round(Number(role.rateInput.value) * 10);
  });

  // 重みの合計（人数 × 割合 を全立場ぶん足したもの）
  let weightSum = 0;
  counts.forEach(function (count, i) {
    weightSum += count * rates10[i];
  });

  const unit = getUnit();
  let collectTotal = 0;
  const rows = roles.map(function (role, i) {
    // 1人あたりを選んだ単位で切り上げる（例：100円なら 3334円 → 3400円）
    const perPerson = Math.ceil((total * rates10[i]) / weightSum / unit) * unit;
    const subtotal = perPerson * counts[i];
    collectTotal += subtotal;
    return { label: role.label, count: counts[i], rate: rates10[i] / 10, perPerson: perPerson, subtotal: subtotal };
  });

  return { rows: rows, collectTotal: collectTotal, remainder: collectTotal - total };
}

// 計算結果を画面に表示する。toLocaleString() で「10,000」のようにカンマ区切りにする
function render(result) {
  resultBody.textContent = '';
  result.rows.forEach(function (row) {
    // 0人の立場は払う人がいないので、金額は「-」にする
    if (row.count === 0) {
      addRow([row.label, '0人', formatRate(row.rate), '-', '-']);
    } else {
      addRow([
        row.label,
        row.count + '人',
        formatRate(row.rate),
        row.perPerson.toLocaleString() + '円',
        row.subtotal.toLocaleString() + '円',
      ]);
    }
  });
  collectTotalText.textContent = result.collectTotal.toLocaleString();
  remainderText.textContent = result.remainder.toLocaleString();
}

// 入力を読み取り、チェックして、計算・表示する
function update() {
  const total = Number(totalInput.value);
  // 人数の空欄は0人として扱う
  const counts = roles.map(function (role) {
    return Number(role.countInput.value);
  });

  const message = validate(total, counts);
  if (message !== '') {
    errorText.textContent = message;
    clearResult();
    return;
  }
  errorText.textContent = '';
  render(calculate(total, counts));
}

// 「計算する」ボタンが押されたときの処理
form.addEventListener('submit', function (event) {
  // フォーム送信でページが再読み込みされるのを止める
  event.preventDefault();
  hasCalculated = true;
  update();
});

// どれかの入力欄・スライダーが動いたときの処理（その場で表示を変える）
form.addEventListener('input', function () {
  updateRateTexts();
  if (hasCalculated) {
    update();
  }
});

// ページを開いたときの表示
updateRateTexts();
clearResult();
