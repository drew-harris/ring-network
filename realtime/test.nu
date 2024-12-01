open realtime/.env | load-env


def sql [query: string] {
    psql $env.DATABASE_URL --csv -c $query | from csv
}

###

sql "select * from messages";

sql "select * from nodes";
