use sea_orm_migration::{prelude::*, sea_orm::Statement};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let db = manager.get_connection();
        db.execute(Statement::from_string(
            sea_orm::DatabaseBackend::Sqlite,
            r#"PRAGMA journal_mode=WAL;"#,
        ))
        .await?;

        manager
            .create_table(
                Table::create()
                    .table(Todo::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Todo::Id).integer().not_null().auto_increment().primary_key())
                    .col(ColumnDef::new(Todo::Title).string().not_null())
                    .col(ColumnDef::new(Todo::Description).text().null())
                    .col(ColumnDef::new(Todo::StartDate).string().null())
                    .col(ColumnDef::new(Todo::EndDate).string().null())
                    .col(ColumnDef::new(Todo::Color).string().null())
                    // 使用 sea_orm_migration 的 .check() 方法，结合 Rust 的格式化字符串提升可读性
                    .col( ColumnDef::new(Todo::Status).string().null())
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(Shortcut::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Shortcut::Id).integer().not_null().auto_increment().primary_key())
                    .col(ColumnDef::new(Shortcut::Path).string().not_null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.get_connection();

        manager
            .drop_table(Table::drop().table(Todo::Table).to_owned())
            .await?;

            manager
            .drop_table(Table::drop().table(Shortcut::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
pub enum Todo {
    #[sea_orm(iden = "todos")]
    Table,
    Id,
    Title,
    Description,
    #[sea_orm(iden = "start_date")]
    StartDate,
    #[sea_orm(iden = "end_date")]
    EndDate,
    Color,
    Status,
}


#[derive(DeriveIden)]
pub enum Shortcut {
    #[sea_orm(iden = "shortcuts")]
    Table,
    Id,
    #[sea_orm(iden = "path")]
    Path,
}