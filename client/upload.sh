pnpm run build
echo "Uploading site to drewh cloud enterprises..."
rsync -r ./dist/** hetzner:/root/sites/nodes
echo "Uploaded!"
