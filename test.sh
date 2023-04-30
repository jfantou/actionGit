echo "Hi There! $1"
git clone git@github.com:jfantou/$1.git
cp /resources/yaml/test.yaml .~/$1
git add .
git commit -m "Update common yaml files"
git push