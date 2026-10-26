// ==UserScript==
// @name         플로팅 계산기
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Alt + C를 누르면 마우스 커서 근처에 간단한 계산을 할 수 있는 입력창이 나타납니다.
// @author       JKAKK
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/junsarakill/jk-float-quick-calculator/main/JKFQC.user.js
// @downloadURL  https://raw.githubusercontent.com/junsarakill/jk-float-quick-calculator/main/JKFQC.user.js
// @grant        none
// ==/UserScript==

(function()
{
    // 엄격 모드 적용
    'use strict';

    // 마우스 커서 좌표를 저장할 변수
    let mouseX = 0;
    let mouseY = 0;

    // 마우스 움직임 감지
    window.addEventListener('mousemove', function(event)
    {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }, true);

    // 단축키 감지 (Alt + C)
    window.addEventListener('keydown', function(event)
    {
        if (event.altKey && event.key.toLowerCase() === 'c')
        {
            event.preventDefault();
            toggleCalculator();
        }
    });

    let calcBox = null;

    // 공통 스타일 정의
    const styles = {
        box: {
            position: 'fixed',
            zIndex: '999999',
            backgroundColor: '#ffffff',
            border: '1px solid #ccc',
            padding: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            borderRadius: '6px',
            fontFamily: 'sans-serif',
            fontSize: '14px'
        },
        input: {
            width: '200px',
            padding: '5px',
            boxSizing: 'box-sizing',
            marginBottom: '5px',
            outline: 'none'
        },
        result: {
            color: '#333',
            minHeight: '20px',
            fontWeight: 'bold'
        }
    };

    // 스타일 적용 헬퍼 함수
    function applyStyles(element, styleObj)
    {
        for (let key in styleObj)
        {
            element.style[key] = styleObj[key];
        }
    }

    // 계산기 플로팅 박스를 토글하는 함수
    function toggleCalculator()
    {
        if (calcBox)
        {
            calcBox.remove();
            calcBox = null;
            return;
        }

        // 플로팅 박스 요소 생성
        calcBox = document.createElement('div');
        applyStyles(calcBox, styles.box);
        calcBox.style.left = mouseX + 'px';
        calcBox.style.top = mouseY + 'px';

        // 수식 입력 필드 생성
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '수식 입력 (예: 500 * 1.1)';
        applyStyles(input, styles.input);

        // 결과 표시 영역 생성
        let resultDiv = document.createElement('div');
        applyStyles(resultDiv, styles.result);

        calcBox.appendChild(input);
        calcBox.appendChild(resultDiv);
        document.body.appendChild(calcBox);

        // 입력 값 변경 시 실시간 계산 수행
        input.addEventListener('input', function()
        {
            let expr = input.value.trim();
            if (expr === '')
            {
                resultDiv.textContent = '';
                return;
            }

            try
            {
                // 허용된 문자(숫자, 사칙연산, 괄호, 소수점, 공백)만 필터링
                let sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
                if (sanitized !== expr)
                {
                    resultDiv.textContent = '허용되지 않는 문자 포함';
                    return;
                }

                // 수식 계산
                let res = Function('return ' + sanitized)();
                if (isFinite(res))
                {
                    resultDiv.textContent = '= ' + res;
                }
                else
                {
                    resultDiv.textContent = '계산 불가';
                }
            }
            catch (e)
            {
                // 미완성 수식 입력 중에는 결과를 비워둠
                resultDiv.textContent = '';
            }
        });

        // ESC 키를 누르면 계산기 닫기
        input.addEventListener('keydown', function(e)
        {
            if (e.key === 'Escape')
            {
                calcBox.remove();
                calcBox = null;
            }
        });

        // 생성 직후 입력창에 포커스 부여
        input.focus();

        // 바깥 영역을 클릭하면 계산기가 닫히도록 처리
        function outsideClickHandler(e)
        {
            if (calcBox && !calcBox.contains(e.target))
            {
                calcBox.remove();
                calcBox = null;
                window.removeEventListener('click', outsideClickHandler);
            }
        }

        setTimeout(function()
        {
            window.addEventListener('click', outsideClickHandler);
        }, 100);
    }
})();