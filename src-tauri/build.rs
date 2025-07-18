fn main() {
  tauri_build::build();
  
  // 确保 OUT_DIR 环境变量被正确设置
  let out_dir = std::env::var("OUT_DIR").unwrap_or_else(|_| {
    let out_dir = "target/out";
    println!("cargo:rustc-env=OUT_DIR={}", out_dir);
    out_dir.to_string()
  });
  
  // 重新设置 OUT_DIR 以确保它可用
  println!("cargo:rustc-env=OUT_DIR={}", out_dir);
}
