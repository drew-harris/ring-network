def sql [query: string] {
    psql -U postgres --csv -c $query | from csv
}

### 

#@ get nodes
sql "select * from nodes"

#@ dev
zsh -ilc 'pnpm run dev'
