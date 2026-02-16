*** Settings ***
Library           SeleniumLibrary

*** Test Cases ***
Diak_FeladatBeadas
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    aut_test
    SeleniumLibrary.Input Password    //*[@id="password"]    auttest
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[2]
    Click Element    //*[@id="app"]/div/aside/ul/a[2]
    Wait Until Element Is Visible    //*[@id="taskList"]/li/div[4]/button/i
    Click Element    //*[@id="taskList"]/li/div[4]/button/i
    Handle Alert    ACCEPT
    Sleep    3s
    Close Browser
