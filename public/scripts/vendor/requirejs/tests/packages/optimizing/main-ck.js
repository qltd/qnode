require.config({packages:[{name:"engine",location:"packages/engine"},{name:"tires",location:"packages/tires"},{name:"fuel",location:"packages/fuel"}]});define(["engine","tires","fuel"],function(e,t,n){doh.register("optimizingPackages",[function(i){i.is("engine",e.name);i.is("pistons",e.pistonsName);i.is("sparkplugs",e.sparkplugsName);i.is("tires",t.name);i.is("fuel",n.name)}]);doh.run()});