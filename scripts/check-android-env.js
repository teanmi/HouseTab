const required = ["adb", "java", "node"];

required.forEach(cmd => {
  require("child_process").exec(`${cmd} --version`, err => {
    if (err) {
      console.error(`Missing: ${cmd}`);
      process.exit(1);
    }
  });
});
