// Questão 1
console.log("Questão 1");
function isArray(input) {
  return Array.isArray(input);
}

// Questão 1 - Teste
console.log(1.1, isArray([]));
console.log(1.2, isArray({}));

// ================================================

// Questão 2
console.log("Questão 2");
function clonarArray(arr) {
  return [...arr];
}

// Questão 2 - Teste
const array2 = [1, 2, 3];
const array2Clone = clonarArray(array2);
array2Clone.push(4);
console.log(2.1, { array2, array2Clone });

// ================================================

// Questão 3
console.log("Questão 3");
function nPrimeirosElementos(arr, n = 1) {
  return arr.slice(0, n);
}

// Questão 3 - Teste
const array3 = [1, 2, 3, 4, 5];
console.log(3.1, nPrimeirosElementos(array3));
console.log(3.2, nPrimeirosElementos(array3, 3));

// ================================================

// Questão 4
console.log("Questão 4");
function nUltimosElementos(arr, n = 1) {
  return arr.slice(-n);
}

// Questão 4 - Teste
const array4 = [1, 2, 3, 4, 5];
console.log(4.1, nUltimosElementos(array4));
console.log(4.2, nUltimosElementos(array4, 3));

// ================================================

// Questão 5
console.log("Questão 5");
function arrToString(arr) {
  return arr.reduce((acc, cur) => `${acc}${cur}`, "");
}

// Questão 5 - Teste
console.log(5.1, arrToString(["h", "t", "m", "l", 5]));

// ================================================

// Questão 6
console.log("Questão 6");
function tracosEntrePares(num) {
  return String(num)
    .split("")
    .reduce((acc, cur) => {
      const lastNumber = Number(acc[acc.length - 1]);
      if ([lastNumber, cur].every((n) => n % 2 === 0)) {
        return `${acc}-${cur}`;
      }
      return `${acc}${cur}`;
    }, "");
}

// Questão 6 - Teste
console.log(6.1, tracosEntrePares("025468"));

// ================================================

// Questão 7
console.log("Questão 7");
function maisFrequente(arr) {
  const frequencias = new Map();
  arr.forEach((v) => frequencias.set(v, (frequencias.get(v) ?? 0) + 1));
  const maiorFrequencia = Math.max(...frequencias.values());
  return Array.from(frequencias.entries()).find(
    ([_v, freq]) => freq === maiorFrequencia
  )[0];
}

// Questão 7 - Teste
console.log(7.1, maisFrequente([1, 2, 4, 2, "a", "ab", "b", "b", 9, 9, "b"]));

// ================================================

// Questão 8
console.log("Questão 8");
function removerDuplicatas(arr) {
  return Array.from(new Set(arr.map((v) => v.toLowerCase())));
}

// Questão 8 - Teste
console.log(
  8.1,
  removerDuplicatas([
    "abc",
    "acb",
    "bac",
    "bca",
    "cab",
    "cba",
    "ABC",
    "ACb",
    "bac",
    "bca",
    "CaB",
  ])
);

// ================================================

// Questão 9
console.log("Questão 9");
function somaArrays(arr1, arr2) {
  const indiceMaior = Math.max(arr1.length, arr2.length);
  const somas = [];
  for (let i = 0; i < indiceMaior; i++) {
    somas[i] = (arr1[i] ?? 0) + (arr2[i] ?? 0);
  }
  return somas;
}

// Questão 9 - Teste
console.log(9.1, somaArrays([1, 2, 3, 4], [4, 3, 2, 1, 5]));

// ================================================

// Questão 10
console.log("Questão 10");
const vetorPilha = [1, 2, 3, 4, 5];
const vetorAdiciona = [6, 7, 8, 9, 10];
vetorPilha.push(...vetorAdiciona);
console.log(10.1, { vetorPilha, vetorAdiciona });
