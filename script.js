let investments = {};
let currentEditingDate = null;
let tempInvestments = [];
let currentYear;
let currentMonth;
let currentUser = null;

function createCalendar() {
    const calendar = document.getElementById('calendar');
    const year = parseInt(document.getElementById('yearSelect').value);
    const month = parseInt(document.getElementById('monthSelect').value);
    currentYear = year;
    currentMonth = month;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    calendar.innerHTML = '';

    // 添加空白天数
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendar.appendChild(emptyDay);
    }

    // 添加日期
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        
        const profitDiv = document.createElement('div');
        profitDiv.className = 'day-profit';
        
        if (investments[date]) {
            const totalProfit = calculateDayProfit(date);
            dayDiv.classList.add(totalProfit >= 0 ? 'profit' : 'loss');
            profitDiv.textContent = totalProfit >= 0 ? `+${totalProfit}` : totalProfit;
        }
        
        dayDiv.appendChild(dayNumber);
        dayDiv.appendChild(profitDiv);
        dayDiv.onclick = () => showModal(date);
        calendar.appendChild(dayDiv);
    }
}

function calculateDayProfit(date) {
    if (!investments[date]) return 0;
    return investments[date].items.reduce((sum, item) => sum + item.amount, 0);
}

function showModal(date) {
    currentEditingDate = date;
    const modal = document.getElementById('editModal');
    const modalDate = document.getElementById('modalDate');
    modalDate.textContent = date;
    
    // 加载已有的投资记录
    tempInvestments = investments[date]?.items || [];
    updateInvestmentList();
    
    // 清空输入框
    document.getElementById('investmentName').value = '';
    document.getElementById('investmentAmount').value = '';
    
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('hidden');
    tempInvestments = [];
}

function addInvestmentItem() {
    const name = document.getElementById('investmentName').value;
    const amount = parseFloat(document.getElementById('investmentAmount').value);
    
    if (!name || isNaN(amount)) {
        alert('请输入完整的投资信息');
        return;
    }
    
    tempInvestments.push({ name, amount });
    updateInvestmentList();
    
    // 清空输入框
    document.getElementById('investmentName').value = '';
    document.getElementById('investmentAmount').value = '';
}

function updateInvestmentList() {
    const list = document.getElementById('investmentList');
    list.innerHTML = '';
    tempInvestments.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'investment-item';
        div.innerHTML = `
            <div>
                <span>${item.name}</span>
                <span class="amount ${item.amount >= 0 ? 'profit' : 'loss'}">
                    ${item.amount >= 0 ? '+' : ''}${item.amount}
                </span>
            </div>
            <button class="delete-btn" onclick="removeInvestmentItem(${index})">删除</button>
        `;
        list.appendChild(div);
    });
}

function removeInvestmentItem(index) {
    tempInvestments.splice(index, 1);
    updateInvestmentList();
}

function saveDetails() {
    if (tempInvestments.length > 0) {
        investments[currentEditingDate] = {
            items: [...tempInvestments]
        };
    } else {
        delete investments[currentEditingDate];
    }
    
    saveUserData();
    createCalendar();
    updateMonthlyTotal();
    closeModal();
}

// 初始化年月选择器
function initializeDateSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    
    // 设置年份选项（前后10年）
    const currentDate = new Date();
    currentYear = currentDate.getFullYear();
    currentMonth = currentDate.getMonth();
    
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // 设置月份选项
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', 
                   '7月', '8月', '9月', '10月', '11月', '12月'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        if (index === currentMonth) option.selected = true;
        monthSelect.appendChild(option);
    });
}

function previousMonth() {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    updateSelectValues();
    createCalendar();
}

function nextMonth() {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    updateSelectValues();
    createCalendar();
}

function updateSelectValues() {
    document.getElementById('yearSelect').value = currentYear;
    document.getElementById('monthSelect').value = currentMonth;
}

// 登录功能
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 这里应该调用后端API进行验证
    // 现在用localStorage模拟
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username] && users[username].password === password) {
        currentUser = username;
        loadUserData();
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
    } else {
        alert('用户名或密码错误');
    }
}

// 注册功能
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
        alert('用户名已存在');
        return;
    }
    
    users[username] = { password };
    localStorage.setItem('users', JSON.stringify(users));
    alert('注册成功，请登录');
}

// 加载用户数据
function loadUserData() {
    const userData = localStorage.getItem(`investments_${currentUser}`);
    if (userData) {
        investments = JSON.parse(userData);
    } else {
        investments = {};
    }
    createCalendar();
    updateMonthlyTotal();
}

// 保存用户数据
function saveUserData() {
    if (currentUser) {
        localStorage.setItem(`investments_${currentUser}`, JSON.stringify(investments));
    }
}

// 计算并更新月度总计
function updateMonthlyTotal() {
    const monthlyTotal = document.getElementById('monthlyTotal');
    let total = 0;
    
    Object.entries(investments).forEach(([date, data]) => {
        const [year, month] = date.split('-').map(Number);
        if (year === currentYear && month === currentMonth + 1) {
            total += calculateDayProfit(date);
        }
    });
    
    monthlyTotal.textContent = total >= 0 ? `+${total}` : total;
    monthlyTotal.className = `summary-amount ${total >= 0 ? 'positive' : 'negative'}`;
}

// 初始化时从本地存储加载数据
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        loadUserData();
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
    }
    initializeDateSelectors();
    createCalendar();
    updateMonthlyTotal();
};