package com.digestivesystem.dsbackend.infrastructure.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;

@Configuration
public class FlywayConfig {

    private final DataSource postgresDataSource;
    private final DataSource mysqlDataSource;

    public FlywayConfig(@Qualifier("postgresDataSource") DataSource postgresDataSource,
                        @Qualifier("mysqlDataSource") DataSource mysqlDataSource) {
        this.postgresDataSource = postgresDataSource;
        this.mysqlDataSource = mysqlDataSource;
    }

    @PostConstruct
    public void migrate() {
        Flyway postgresFlyway = Flyway.configure()
                .dataSource(postgresDataSource)
                .locations("classpath:db/migration/postgres")
                .load();
        postgresFlyway.migrate();

        Flyway mysqlFlyway = Flyway.configure()
                .dataSource(mysqlDataSource)
                .locations("classpath:db/migration/mysql")
                .load();
        mysqlFlyway.migrate();
    }
}
