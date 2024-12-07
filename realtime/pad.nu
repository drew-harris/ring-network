let db = $env.DATABASE_URL
def sql [query: string] {
    psql $db --csv -c $query | from csv
}
###

#@ client
sql "select * from realtime_client"

#@ nodes
sql "select * from nodes"

#@ messages
sql "select * from messages" | explore
