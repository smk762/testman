[ ! -d coins_versions ] && mkdir coins_versions
cd coins_versions
commit=$(echo $1 | grep / | cut -d/ -f6)
[ ! -f coins_${commit} ] && wget $1 && mv coins coins_${commit}
cp coins_${commit} ../public/coins
