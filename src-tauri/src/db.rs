use migration::{Migrator, MigratorTrait};
use service::sea_orm::{Database, DatabaseConnection};
use std::env;
use std::path::PathBuf;

pub async fn setup_database() -> DatabaseConnection {
    let db_url = get_database_url();
    println!("Connecting to database: {}", db_url);
    println!("Database URL: {}", db_url);
    let db_conn = Database::connect(&db_url)
        .await
        .expect(&format!("Error connecting to {}", &db_url));

    println!("Running database migrations...");
    Migrator::up(&db_conn, None)
        .await
        .expect("unable to run migrations");
    
    println!("Database setup completed successfully");
    return db_conn;
}


fn get_app_base_dir() -> PathBuf {
    let exe_path = env::current_exe().expect("Failed to get current exe path");
    exe_path.parent().unwrap().to_path_buf()
}

fn get_database_url() -> String {
    // 在开发和生产环境中都使用本地 SQLite 文件
    let home_dir = get_app_base_dir();
    let data_dir = home_dir.join("data/");
    println!("data_dir: {}", data_dir.to_string_lossy());
    std::fs::create_dir_all(&data_dir)
        .unwrap_or_else(|_| panic!("Could not create data directory"));
    format!("sqlite://{}db.sqlite?mode=rwc", data_dir.to_string_lossy())
}
