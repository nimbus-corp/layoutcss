module.exports = {
    install: function(less, pluginManager, functions) {
        functions.add('rows', function(values) {
            let row_string = '';
            for(let value of values.value){
                if(value.value != ' '){
                    console.log(value.value)
                    row_string += `a${value.value}`;
                    row_string += " ";
                }
            }
            let rows = row_string.split('a_');
            rows = '"' + rows.join('" "') + '"';
            
            return rows;
        });
        functions.add('single_values', function(values) {
            let unique_values = new Set();
            for(let value of values.value){
                if(value.value != '_' && value.value != ' '){
                    unique_values.add(`a${value.value}`);
                }
            }
            unique_values = Array.from(unique_values);

            return new tree.Expression(unique_values);
        });
    }
};