// sticky thead for tables
applyFrozenTablehead(".tableFixHead1");
applyFrozenTablehead(".tableFixHead2");


// inner href anamation
const realtimeIndexSelector = "body > div > div:nth-child(1) > div.col-lg-4.text-center.mt-5.mb-3 > div > ul > li:nth-child(2) > a";
const optDisPriceSelector = "body > div > div:nth-child(1) > div.col-lg-4.text-center.mt-5.mb-3 > div > ul > li:nth-child(3) > a";
const userPartSelector = "body > div > div:nth-child(1) > div.col-lg-4.text-center.mt-5.mb-3 > div > ul > li:nth-child(4) > a";
applyInnerHrefAnimationListener(realtimeIndexSelector, 120, 300);
applyInnerHrefAnimationListener(optDisPriceSelector, 120, 400);
applyInnerHrefAnimationListener(userPartSelector, 120, 500);


// trade parameters
let optDis = 0;
let userParts = 0;
let optDisNameSeq = ["call_var", "call_deal", "call_sell", "call_buy", "target", "put_buy", "put_sell", "put_deal", "put_var"];
let userPartsNameSeq = ["prod_month", "prod_target", "prod_act", "prod_cp", "prod_number", "prod_cost"];
let isOpen = false;

const tbody4OptDis = document.querySelector("#optDisTable table tbody");
const tbody4UserPart = document.querySelector("#user-part > div > table > tbody");
const userPartsRegion = document.querySelector("body > div > div:nth-child(1) > div.col-lg-4.text-center.mt-5.mb-3 > div > ul > li:nth-child(4) > a");

// socket
socket.on("realtimeOpt", (receiver) => {

	optDis = receiver;
	let { data } = receiver;
	const tbody4OptDis = document.querySelector("#optDisTable table tbody");
	const tobody4UserPart = document.querySelector("#user-part > div > table > tbody");
	const optDistrs = tbody4OptDis.querySelectorAll("tr");
	const userParttrs = tobody4UserPart.querySelectorAll("tr");
    
	// display optDis
	for (let i = 0; i < optDistrs.length; i++) {
		let tds = optDistrs[i].querySelectorAll("td");
		for (let j = 0; j < tds.length; j++) {
			if ( 0 < j && j < tds.length-1 ) {
				let fillContent = data[i][optDisNameSeq[j-1]];
				if (2 <= j && j <= 8) {

					// flash
					if (tds[j].innerText != "" && tds[j].innerText != data[i][optDisNameSeq[j-1]]) {
						applyFlashBackground(tds[j], 2000);
					}                  
				} else {

					// change up's & down's colors
					if (fillContent > 0) {
						tds[j].style.color = "blue";
					} else if (fillContent < 0) {
						tds[j].style.color = "red";
					}
				}
				tds[j].innerText = fillContent;
			}
		}
	}

	// display userPart profit
	for (let i = 0; i < userParttrs.length; i++) {
		let tds = userParttrs[i].querySelectorAll("td");
		for (let j = 0; j < tds.length; j++) {
			if ( 0 < j && j < tds.length-1) {
				let target = tds[1].innerText;
				let cp = tds[3].innerText;
				let cost = tds[5].innerText;
				let number = tds[4].innerText;
				let nowPrice = nowPriceGetter(optDis, target, cp);
				let profit = Math.floor((Number(nowPrice) - Number(cost)) * Number(number) * 50);
				tds[6].innerText = nowPriceGetter(optDis, target, cp);
				tds[7].innerText = profit.toString();
				if (profit > 0) {
					tds[7].style.color = "#0d00ff";
				} else {
					tds[7].style.color = "#ff0000";
				}
			}
		}
	}
});

socket.on("time", (receiver) => {
	let {
		dateOfWeek,
		isDay,
		isNight,
		nowHour,
	} = receiver;

	const weekdaysArray = [1, 2, 3, 4, 5];
	let isTradeTime = isDay || isNight;
	let isOpenOnWeedays = weekdaysArray.includes(receiver.dateOfWeek) && isTradeTime;
	let isOpenOnSaturday = dateOfWeek == 6 && nowHour <= 5;

	if (isOpenOnWeedays || isOpenOnSaturday) {
		isOpen = true;
	}
});


// user authentication
checkTokenWhileWindowLoad(token)
	.then(result => {
		try {
			const { msg } = result;
			const navSignIn = document.querySelector("#navbarResponsive > ul > li:nth-child(4) > a");

			if (msg == "valid") {
				navSignIn.textContent = `個人頁面`;
				navSignIn.className = "btn btn-success";
				navSignIn.href = "profile.html";
				return fetchPack("/api/1.0/time/getBackEndTime", "GET");
			} else {
				throw new Error(msg);
			}
		} catch (excep) {
			throw new Error(excep.message);
		}
	})
	.then(result => {
		try {
			if (result.msg != "fail") {
				let {
					dateOfWeek,
					isDay,
					isNight,
					nowHour,
				} = result;
		
				const weekdaysArray = [1, 2, 3, 4, 5];
				let isTradeTime = isDay || isNight;
				let isOpenOnWeedays = weekdaysArray.includes(result.dateOfWeek) && isTradeTime;
				let isOpenOnSaturday = dateOfWeek == 6 && nowHour <= 5;
		
				if (isOpenOnWeedays || isOpenOnSaturday) {
					isOpen = true;
				}
				
				return fetchPack("/api/1.0/realtime/getIndex", "GET");
			} else {
				throw new Error(result.msg);
			}	

		} catch (excep) {
			if (result.msg == "fail") {
				throw new Error("Current Time Derivation Error");
			}
		}

	})
	.then(result => {
		try {

			// ---------- render OptDis ----------
			optDis = result.optDis;
			let { data } = result.optDis;
			showOptDisInTable(data, tbody4OptDis);
			const btns = document.querySelectorAll("button.buy");
			btns.forEach(btn => { btn.addEventListener("click", clickBuy); });
			return fetchPack("/api/1.0/trade/showUserParts", "POST", {userId: userId});

		} catch (excep) {
			throw new Error("Option Price Error");
		}	
	})
	.then(result => {
		try {
			userParts = result;

			// ---------- render User Parts ----------
			showUserPartsInTable(result, tbody4UserPart);
			const btns = document.querySelectorAll("button.liquidation");
			btns.forEach(btn => { btn.addEventListener("click", click2LiquidateParts); });
			return fetchPack("/api/1.0/trade/showUserMoneyLeftnTotalprofit", "POST", {userId: userId});
		
		} catch (excep) {
			throw new Error("User Part Error");
		}
	})
	.then(result => {
		try {
			const userMoneyLeftDiv = document.querySelector("#money-left");
			showUserMoneyLeftnTotalProfit(result, userMoneyLeftDiv);

		} catch (excep) {
			throw new Error("User Money Error");
		}
	})
	.catch((excep) => {
		if (excep.message == "expire") {
			swal({
				title: "登入逾期",
				text: "請重新登入",
				icon: "warning",
				button: "確認"
			})
				.then(() => {
					window.location.href = `${protocol}//${domain}` + "/signin.html";
				});
		} else if (excep.message == "empty") {
			swal({
				title: "未能辨別使用者",
				text: "請先登入",
				icon: "warning",
				button: "確認"
			})
				.then(() => {
					window.location.href = `${protocol}//${domain}` + "/signin.html";
				});
		} else if (excep.message == "Current Time Derivation Error") {
			swal({
				title: "Error",
				text: `${excep.message}`,
				icon: "error",
				button: "確認返回首頁"
			})
				.then(() => {
					window.location.href = `${protocol}//${domain}` + "/index.html";
				});
		} else {
			swal({
				title: "Error",
				text: "User's Information Error",
				icon: "error",
				button: "確認返回首頁"
			})
				.then(() => {
					window.location.href = `${protocol}//${domain}` + "/index.html";
				});
		}
	});



// functions
const nowPriceGetter = (optDis, target, cp) => {
	for (let i = 0; i < optDis.data.length; i++) {
		if (optDis.data[i].target == target) {
			if (cp == "call") {
				return optDis.data[i].call_buy;
			} else if (cp == "put") {
				return optDis.data[i].put_buy;
			}
		}
	}
};


const clickBuy = (e) => { 
	const tableString = `#optDisTable > table > tbody > `;
	let numberOfRow = e.path[2].rowIndex - 1;
	let numberOfItem = e.path[1].cellIndex + 1;
	let target = document.querySelector(tableString + `tr:nth-child(${numberOfRow}) > td:nth-child(6)`).innerText;
	let input = document.querySelector(tableString + `tr:nth-child(${numberOfRow}) > td:nth-child(${numberOfItem}) > input`);
    
	let cp = "";
	let costNumber = 0;
	if (numberOfItem < 6) {
		cp = "call";
		costNumber = 4;
	} else {
		cp = "put";
		costNumber = 8;
	}
	let cost = document.querySelector(tableString + `tr:nth-child(${numberOfRow}) > td:nth-child(${costNumber})`);

	let carton = {
		userId: userId,
		target: target,
		act: "buy",
		month: optDis.date,
		cp: cp,
		number: Number(input.value),
		cost: Number(cost.innerText),
	};
    
	if (!isOpen) {
		swal({
			title: "收盤時間，停止交易",
			icon: "warning",
			button: "確認"
		});
	} else if (Number(input.value) < 1 || Number(input.value) % 1 != 0) {
		swal({
			title: "請輸入正整數",
			icon: "warning",
			button: "確認"
		});
	} else if (Number(cost.innerText) <= 2.5) {
		swal({
			title: "交易失敗",
			text: "歸零風險極大。風險設定為2.5元/口。",
			icon: "error",
			button: "確認"
		});
	} else {
		try {
			const allBuyInputs = document.querySelectorAll(".buyInput");
			allBuyInputs.forEach(input => input.disabled = true);
			fetchPack("/api/1.0/trade/buyParts", "POST", carton)
				.then(result => {
					if (result.msg == "success") {
						swal({
							title: "購買成功",
							icon: "success",
							button: "確認"
						})
							.then(() => {
								allBuyInputs.forEach(input => input.disabled = false);
								userPartsRegion.click();
								updateUserMoneynParts(userId);
							});
					} else if (result.msg == "notEnough") {
						swal({
							title: "餘額不足",
							icon: "warning",
							button: "確認"
						})
							.then(() => {
								allBuyInputs.forEach(input => input.disabled = false);
							});
					} else {
						throw new Error();
					}
				});
		} catch {
			swal({
				title: "Error",
				text: "購買錯誤",
				icon: "error",
				button: "確認"
			})
				.then(() => {
					allBuyInputs.forEach(input => input.disabled = false);
				});
		}
	}
	input.value = "";
};


const click2LiquidateParts = (e) => {
	const tableString = `#user-part > div > table > tbody > `;
	try {
		if (!isOpen) {
			swal({
				title: "收盤時間，停止交易",
				icon: "warning",
				button: "確認"
			});
		} else {
			const allLiquidateBtn = document.querySelectorAll(".liquidation");
			allLiquidateBtn.forEach(btn => btn.disabled = true);
	
			const numberOfRow = e.path[1].rowIndex;
			const partId = userParts[numberOfRow-1].id;
			const userId = userParts[numberOfRow-1].user_id;
			const number = Number(document.querySelector(tableString + `tr:nth-child(${numberOfRow}) > td:nth-child(5)`).innerText);
			const nowPrice = Number(document.querySelector(tableString + `tr:nth-child(${numberOfRow}) > td:nth-child(7)`).innerText);
			const profit = Number(document.querySelector(tableString + `tr:nth-child(${numberOfRow}) > td:nth-child(8)`).innerText);
	
			const carton = {
				partId: partId,
				userId: userId,
				number: number,
				nowPrice: nowPrice,
				profit: profit
			};
			
			fetchPack("/api/1.0/trade/liquidateParts", "POST", carton)
				.then(result => {
					if (result.msg == "success") {
						swal({
							title: "平倉成功",
							icon: "success",
							button: "確認"
						})
							.then(result => {
								allLiquidateBtn.forEach(btn => btn.disabled = false);
								updateUserMoneynParts(userId);
							});
					} else {
						throw new Error();
					}
				});
		}
	} catch {
		swal({
			title: "平倉失敗",
			icon: "error",
			button: "確認返回"
		})
			.then(() => {
				const allLiquidateBtn = document.querySelectorAll(".liquidation");
				allLiquidateBtn.forEach(btn => btn.disabled = false);
			});
	}
};


const showUserPartsInTable = (result, tbody) => {
	const itemLength = result.length;
	for (let i = 0; i < itemLength; i++) {
		let tr = document.createElement("tr");
		for (let j = 0; j < 9; j++) {
			if (j < 6) {
				let td = document.createElement("td");
				td.innerText = result[i][userPartsNameSeq[j]];
				tr.appendChild(td);
			} else if (j == 8) {
				let btn = document.createElement("button");
				btn.className = "liquidation btn btn-info btn-sm my-2";
				btn.innerText = "平倉";
				tr.appendChild(btn);
			} else {
				let td = document.createElement("td");
				let target = result[i][userPartsNameSeq[1]];
				let cp = result[i][userPartsNameSeq[3]];
				let cost = result[i][userPartsNameSeq[5]];
				let number = result[i][userPartsNameSeq[4]];
				if (j == 6) {
					td.innerText = nowPriceGetter(optDis, target, cp);
				} else {
					let profit = Math.floor((Number(nowPriceGetter(optDis, target, cp)) - Number(cost)) * number * 50);
					td.innerText = profit.toString();
					if (profit > 0) {
						td.style.color = "#0d00ff";
					} else {
						td.style.color = "#ff0000";
					}
				}
				tr.appendChild(td);
			}
		}
		tbody.appendChild(tr);
	}

};


const showOptDisInTable = (result, tbody) => {
	let itemLength = result.length;

	for (let i = 0; i < itemLength; i++) {
		let tr = document.createElement("tr");
		for (let j = 0; j < 11; j++) {
			if (j == 0 || j == 10) {
				let td = document.createElement("td");
				let btn = document.createElement("button");
				let input = document.createElement("input");
				input.className = "buyInput mx-2";
				input.style.width = "50px";
				btn.innerText = "購買";
				if (j == 0) {
					btn.className = "buy btn btn-sm btn-danger";
					td.appendChild(btn);
					td.appendChild(input);
				} else {
					btn.className = "buy btn btn-sm btn-success";
					td.appendChild(input);
					td.appendChild(btn);
				}
				tr.appendChild(td);
			} else {
				let td = document.createElement("td");
				let fillContent = result[i][optDisNameSeq[j-1]];
				if (j == 5) {
					td.className = "table-active";
				} else if (j == 1 || j == 9) {
					if (fillContent > 0) {
						td.style.color = "blue";
					} else if (fillContent < 0) {
						td.style.color = "red";
					}
				}
				td.innerText = fillContent;
				tr.appendChild(td);
			}

		}
		tbody.appendChild(tr);
	}
};


const showUserMoneyLeftnTotalProfit = (result, div) => {
	let { moneyLeft, totalprofit } = result;

	const moneyLeftTitle = document.createElement("h4");
	moneyLeftTitle.innerText = "權益數: ";
	const moneyLeftContent = document.createElement("h5");
	moneyLeftContent.id = "moneyLeftContent";
	const totalProfitTitle = document.createElement("h4");
	totalProfitTitle.innerText = "總損益: ";
	totalProfitTitle.classList.add("mt-3");
	const totalProfitContent = document.createElement("h5");
	totalProfitContent.id = "totalProfitContent";
    

	if (moneyLeft) {
		applyRollingNumber($(moneyLeftContent), Number(moneyLeft), "NT$", "", 700);
	} else {
		moneyLeftContent.innerText = 0;
	}


	if (totalprofit) {
		if (totalprofit > 0) {
			totalProfitContent.style.color = "blue";
		} else if (totalprofit < 0) {
			totalProfitContent.style.color = "red";
		}
		applyRollingNumber($(totalProfitContent), Number(totalprofit), "NT$", "", 700);
	} else {
		totalProfitContent.innerText = 0;
	}

	div.appendChild(moneyLeftTitle);
	div.appendChild(moneyLeftContent);
	div.appendChild(totalProfitTitle);
	div.appendChild(totalProfitContent);

}; 


const updateUserMoneynParts = (userId) => {
	fetchPack("/api/1.0/trade/showUserParts", "POST", {userId: userId})
		.then(result => {
			userParts = result;
			const tbody4UserPart = document.querySelector("#user-part > div > table > tbody"); 
			tbody4UserPart.innerHTML = "";
			showUserPartsInTable(result, tbody4UserPart);

			const btns = document.querySelectorAll("button.liquidation");
			btns.forEach(btn => { btn.addEventListener("click", click2LiquidateParts); });

			return fetchPack("/api/1.0/trade/showUserMoneyLeftnTotalprofit", "POST", {userId: userId});
		})
		.then(result => {
			const userMoneyLeftDiv = document.querySelector("#money-left");
			userMoneyLeftDiv.innerHTML = "";
			showUserMoneyLeftnTotalProfit(result, userMoneyLeftDiv);
		});
};
