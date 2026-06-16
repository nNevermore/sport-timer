import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

try {
  console.log("=== Step 1: Building Tauri application (Binary only) ===");
  // We use --no-bundle to skip MSI/EXE bundling. This is much faster and avoids locking issues on MSI/EXE files.
  execSync(
    "npm run tauri build -- --target x86_64-pc-windows-msvc --no-bundle",
    { stdio: "inherit" }
  );

  const srcPath = path.join(
    "src-tauri",
    "target",
    "x86_64-pc-windows-msvc",
    "release",
    "pro-simple-timer.exe"
  );
  const destPath = path.join("staging", "pro-simple-timer.exe");

  console.log("\n=== Step 2: Copying binary to staging ===");
  if (!fs.existsSync("staging")) {
    fs.mkdirSync("staging");
  }
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${srcPath} -> ${destPath}`);

  console.log("\n=== Step 3: Packaging to MSIX ===");
  execSync("winapp package .\\staging --output ProSimpleTimer.msix", {
    stdio: "inherit",
  });

  console.log(
    "\n✅ Success! ProSimpleTimer.msix has been created successfully."
  );
} catch (error) {
  console.error("\n❌ Build failed:", error);
  process.exit(1);
}
