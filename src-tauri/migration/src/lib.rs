pub use sea_orm_migration::prelude::*;

mod utils;

mod m202407020_000001_init_;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    // #[cfg(debug_assertions)]
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m202407020_000001_init_::Migration)
        ]
    }
    //
    // #[cfg(not(debug_assertions))]
    // fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    //     vec![
    //         Box::new(m20220101_000001_init_::Migration),
    //     ]
    // }
}
