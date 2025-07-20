use sea_orm_migration::prelude::*;

mod m202407020_000001_init_;

#[async_std::main]
async fn main() {
    cli::run_cli(migration::Migrator).await;
}
