function tsig = correctsingle(x, factor, decimal)  pkg load signal  e = pvoc(x, factor);  [p,q] = rat(length(x)/length(e), decimal);  tsig = resample(e, p, q);
endfunction
