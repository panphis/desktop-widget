!macro NSIS_HOOK_POSTUNINSTALL
    # 检查并删除安装目录
    IfFileExists "$INSTDIR" 0 +2
        RMDir /r "$INSTDIR"

    # 检查并删除开始菜单快捷方式
    IfFileExists "$SMPROGRAMS\${PRODUCT_NAME}" 0 +2
        RMDir /r "$SMPROGRAMS\${PRODUCT_NAME}"

    # 检查并删除桌面快捷方式
    IfFileExists "$DESKTOP\${PRODUCT_NAME}.lnk" 0 +2
        Delete "$DESKTOP\${PRODUCT_NAME}.lnk"

    # 删除注册表项(删除不存在的键不会报错)
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
    DeleteRegKey HKLM "Software\${PRODUCT_NAME}"
!macroend