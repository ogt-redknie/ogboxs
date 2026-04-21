@ECHO OFF
SETLOCAL

SET "DIR=%~dp0"
IF EXIST "%DIR%gradle\wrapper\gradle-wrapper.jar" (
  SET "WRAPPER_JAR=%DIR%gradle\wrapper\gradle-wrapper.jar"
) ELSE (
  ECHO Gradle wrapper jar not found: "%DIR%gradle\wrapper\gradle-wrapper.jar"
  EXIT /B 1
)

SET "JAVA_EXE=java"
IF NOT "%JAVA_HOME%"=="" (
  SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

"%JAVA_EXE%" -Dorg.gradle.appname=gradlew -classpath "%WRAPPER_JAR%" org.gradle.wrapper.GradleWrapperMain %*

ENDLOCAL
