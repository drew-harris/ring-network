def sql [query: string] {
    psql -U postgres --csv -c $query | from csv
}

### 

#@ get nodes
sql "select * from nodes"

#@ dev
loop {
    zsh -ilc 'pnpm run dev'
    sleep 1sec
}


