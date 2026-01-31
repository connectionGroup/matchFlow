array = [1, 3, 5, 7, 2, 98, 34, 65]

b = 'false'

for i in range(len(array)):
    for j in range(len(array)):
        a = array[i] + array[j]
        if a == 20:
            b = 'true'
            break

print(b)
