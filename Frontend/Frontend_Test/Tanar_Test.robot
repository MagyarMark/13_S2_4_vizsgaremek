*** Settings ***
Library           SeleniumLibrary

*** Test Cases ***
Tanar_FeladatHozzaadas
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[1]
    Click Element    //*[@id="app"]/div/aside/ul/a[1]
    Wait Until Element Is Visible    //*[@id="app"]/div/main/section/div[1]/button
    Click Button    //*[@id="app"]/div/main/section/div[1]/button
    Wait Until Element Is Visible    //*[@id="teamName"]
    SeleniumLibrary.Input Text    //*[@id="teamName"]    Autómata_Feladat
    SeleniumLibrary.Input Text    //*[@id="teamDesc"]    Autómata_Leírás
    Click Button    //*[@id="app"]/div/div[1]/div/form/div[4]/button[2]
    Close Browser

Tanar_FeladatonBeluliFelhasznaloHozzaadas
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[1]
    Click Element    //*[@id="app"]/div/aside/ul/a[1]
    Wait Until Element Is Visible    //*[@id="app"]/div/main/section/div[2]/div[4]
    Click Element    //*[@id="app"]/div/main/section/div[2]/div[4]
    Scroll Element Into View    //*[@id="app"]/div/main/section[2]/div[2]/div[2]/div/div[2]
    Click Button    //*[@id="app"]/div/main/section[2]/div[2]/div[2]/div/div[1]/button
    Wait Until Element Is Visible    //*[@id="memberSelect"]
    Click Element    //*[@id="memberSelect"]
    Wait Until Element Is Visible    //*[@id="memberSelect"]/option[2]
    Click Element    //*[@id="memberSelect"]/option[2]
    Click Button    //*[@id="app"]/div/div[2]/div/form/div[3]/button[2]
    Close Browser

Tanar_FeladatonBeluliFeladatHozzaadas
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[1]
    Click Element    //*[@id="app"]/div/aside/ul/a[1]
    Wait Until Element Is Visible    //*[@id="app"]/div/main/section/div[2]/div[4]
    Click Element    //*[@id="app"]/div/main/section/div[2]/div[4]
    Scroll Element Into View    //*[@id="app"]/div/main/section[2]/div[2]/div[2]/div/div[2]
    Click Button    //*[@id="app"]/div/main/section[2]/div[2]/div[1]/button[2]
    Click Button    //*[@id="app"]/div/main/section[2]/div[2]/div[2]/div/div[1]/button
    Wait Until Element Is Visible    //*[@id="taskTitle"]
    SeleniumLibrary.Input Text    //*[@id="taskTitle"]    Autómata_TesztFeladat
    SeleniumLibrary.Input Text    //*[@id="taskDesc"]    Autómata_TesztLeiras
    Click Element    //*[@id="taskAssignee"]
    Click Element    //*[@id="taskAssignee"]/option[2]
    Click Element    //*[@id="taskPriority"]
    Click Element    //*[@id="taskPriority"]/option[2]
    SeleniumLibrary.Input Text    //*[@id="taskDeadline"]    2026-02-10
    Click Button    //*[@id="app"]/div/div[3]/div/form/div[5]/button[2]
    Close Browser

Tanar_DiakErtekelese
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[2]
    Click Element    //*[@id="app"]/div/aside/ul/a[2]
    Click Element    //*[@id="app"]/div/main/div/section[1]/div[1]/select
    Wait Until Element Is Visible    //*[@id="app"]/div/main/div/section[1]/div[1]/select/option[7]
    Click Element    //*[@id="app"]/div/main/div/section[1]/div[1]/select/option[7]
    Click Element    //*[@id="app"]/div/main/div/section[1]/div[2]/select
    Wait Until Element Is Visible    //*[@id="app"]/div/main/div/section[1]/div[2]/select/option[2]
    Click Element    //*[@id="app"]/div/main/div/section[1]/div[2]/select/option[2]
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/div/section[1]/div[3]/input    80
    SeleniumLibrary.Input Text    //*[@id="app"]/div/main/div/section[1]/div[5]/textarea    Nagyon szép munka
    Click Button    //*[@id="app"]/div/main/div/section[1]/button
    Close Browser

Tanar_DiakStat
    Open Browser    http://localhost:5173/home    Chrome
    Maximize Browser Window
    Click Button    //*[@id="landing"]/div/a[1]/button
    SeleniumLibrary.Input Text    //*[@id="username"]    tanar_janos
    SeleniumLibrary.Input Password    //*[@id="password"]    jelszo123
    Click Button    //*[@id="app"]/main/div/form/button
    Wait Until Element Is Visible    //*[@id="app"]/div/aside/ul/a[2]
    Click Element    //*[@id="app"]/div/aside/ul/a[2]
    Click Element    //*[@id="app"]/div/main/div/section[2]/div[2]/select
    Wait Until Element Is Visible    //*[@id="app"]/div/main/div/section[2]/div[2]/select/option[2]
    Click Element    //*[@id="app"]/div/main/div/section[2]/div[2]/select/option[2]
    Wait Until Element Is Visible    //*[@id="app"]/div/main/div/section[2]/div[3]/div[2]/canvas
    Click Element    //*[@id="app"]/div/main/div/section[2]/div[3]/div[2]/canvas
    Sleep    2s
    Close Browser
