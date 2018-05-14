const fs = require("fs");
fs.readdir("./", (err, files) => {
	for(let f of files){
		if(f == "localize.js"){
			continue;
		}
		console.log(f);
		let content = fs.readFileSync(f, "utf8").substr(1);
		content = JSON.parse(content);
		content.name = {eng: content.name};
		content = JSON.stringify(content);
		fs.writeFileSync(f, content, "utf8");
	}
})