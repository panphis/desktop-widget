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
}


#[derive(DeriveIden)]
pub enum Shortcut {
    #[sea_orm(iden = "shortcuts")]
    Table,
    Id,
    Name,
    Description,
    Url,
}