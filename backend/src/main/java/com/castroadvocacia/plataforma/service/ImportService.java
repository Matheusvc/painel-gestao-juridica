package com.castroadvocacia.plataforma.service;

import com.castroadvocacia.plataforma.model.*;
import com.castroadvocacia.plataforma.repository.ClienteRepository;
import com.castroadvocacia.plataforma.repository.ProcessoRepository;
import com.castroadvocacia.plataforma.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final ProcessoRepository processoRepo;
    private final ClienteRepository clienteRepo;
    private final ServicoRepository servicoRepo;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final byte[] ZIP_MAGIC = {0x50, 0x4B, 0x03, 0x04};

    @Transactional
    public ImportResult importar(MultipartFile file) throws Exception {
        validarArquivo(file);

        List<Processo> processos = new ArrayList<>();
        Set<String> cpfsVistos = new HashSet<>();
        String categoria;

        try (InputStream is = file.getInputStream();
             Workbook wb = new XSSFWorkbook(is)) {

            categoria = derivarCategoria(wb, file.getOriginalFilename());

            processoRepo.deleteByCategoria(categoria);

            for (int i = 0; i < wb.getNumberOfSheets(); i++) {
                Sheet sheet = wb.getSheetAt(i);
                String aba = sheet.getSheetName().trim();
                Map<String, Integer> colunas = mapearColunas(sheet);
                if (colunas.isEmpty()) continue;

                for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                    Row row = sheet.getRow(r);
                    if (row == null || isRowEmpty(row)) continue;

                    Processo p = new Processo();
                    p.setCategoria(categoria);
                    p.setAba(aba);
                    p.setAno(cell(row, colunas, "ANO"));
                    p.setMes(cell(row, colunas, "MÊS", "MES"));
                    p.setCorretor(cell(row, colunas, "CORRETOR"));
                    p.setCliente(cell(row, colunas, "CLIENTE"));
                    p.setCpf(cell(row, colunas, "CPF"));
                    p.setBeneficio(cell(row, colunas, "BENEFÍCIO", "BENEFICIO"));
                    p.setTipo(cell(row, colunas, "TIPO"));
                    p.setFisico(cell(row, colunas, "FISICO", "FÍSICO"));
                    p.setProtocolado(cell(row, colunas, "PROTOCOLADO"));
                    p.setDataProtocolo(cell(row, colunas, "DATA PROTOC.", "DATA PROTOC", "DATA PROTOCOLO"));
                    p.setProtocolo(cell(row, colunas, "PROTOCOLO"));
                    p.setConcessao(cell(row, colunas, "CONCESSÃO", "CONCESSAO"));
                    p.setStatus(cell(row, colunas, "STATUS"));
                    p.setTarefas(cell(row, colunas, "TAREFAS/OBS", "TAREFAS"));
                    p.setObservacao(cell(row, colunas, "OBSERVAÇÃO", "OBSERVACAO", "OBSERVAÇÕES", "OBSERVACOES"));
                    p.setNumeroProcesso(cell(row, colunas, "NÚMERO DO PROCESSO", "NUMERO DO PROCESSO"));
                    p.setEsp(cell(row, colunas, "ESP"));
                    p.setVara(cell(row, colunas, "VARA"));
                    p.setValor(cell(row, colunas, "VALOR"));
                    p.setDataMovimentacao(cell(row, colunas, "DATA DA MOVIMENTAÇÃO", "DATA DA MOVIMENTACAO"));
                    p.setDataImplantacaoBeneficio(cell(row, colunas, "DATA DA IMPLANTAÇÃO DO BENEFÍCIO", "DATA DA IMPLANTACAO DO BENEFICIO", "DATA DA IMPLANTAÇÃO DO BENEFICIO"));

                    if (p.getCliente() == null || p.getCliente().isBlank()) continue;

                    processos.add(p);
                    coletarCliente(cpfsVistos, p.getCliente(), p.getCpf());
                }
            }
        }

        processoRepo.saveAll(processos);

        int proximoNumero = servicoRepo.findAll().stream()
            .map(Servico::getNumero)
            .filter(Objects::nonNull)
            .max(Integer::compareTo)
            .orElse(0);

        List<Servico> servicos = new ArrayList<>();
        for (Processo p : processos) {
            Servico s = new Servico();
            s.setNumero(++proximoNumero);
            s.setTitulo(p.getCliente() != null ? p.getCliente() : "Sem título");
            s.setTipoServico(p.getBeneficio() != null ? p.getBeneficio() : (p.getTipo() != null ? p.getTipo() : categoria));
            s.setResponsavel(p.getCorretor() != null ? p.getCorretor() : "");
            s.setStatus(p.getStatus() != null && !p.getStatus().isBlank() ? p.getStatus() : "Aberto");
            s.setValorTotal(parseValor(p.getValor()));
            s.setCategoria(categoria);
            servicos.add(s);
        }
        servicoRepo.saveAll(servicos);

        return new ImportResult(categoria, processos.size());
    }

    public List<String> listarCategorias() {
        return processoRepo.findDistinctCategorias();
    }

    @Transactional
    public void removerCategoria(String categoria) {
        processoRepo.deleteByCategoria(categoria);
        servicoRepo.deleteByCategoria(categoria);
    }

    private String derivarCategoria(Workbook wb, String filename) {
        if (wb instanceof XSSFWorkbook xssf) {
            var props = xssf.getProperties().getCoreProperties();
            String title = props.getTitle();
            if (title != null && !title.isBlank()) return title.trim();
        }
        if (wb.getNumberOfSheets() == 1) {
            return wb.getSheetAt(0).getSheetName().trim();
        }
        if (filename != null && !filename.isBlank()) {
            String name = filename;
            int dot = name.lastIndexOf('.');
            if (dot > 0) name = name.substring(0, dot);
            return name.trim();
        }
        return "Planilha importada";
    }

    private void coletarCliente(Set<String> cpfsVistos, String nome, String cpf) {
        if (cpf == null || cpf.isBlank()) return;
        String cpfLimpo = cpf.replaceAll("[^0-9]", "");
        if (cpfLimpo.isEmpty() || cpfsVistos.contains(cpfLimpo)) return;
        cpfsVistos.add(cpfLimpo);

        boolean existe = clienteRepo.findAll().stream()
            .anyMatch(c -> c.getCpf() != null && c.getCpf().replaceAll("[^0-9]", "").equals(cpfLimpo));
        if (!existe) {
            var c = new Cliente();
            c.setNome(nome.trim());
            c.setCpf(cpf.trim());
            c.setStatus(StatusCliente.ATIVO);
            clienteRepo.save(c);
        }
    }

    private Map<String, Integer> mapearColunas(Sheet sheet) {
        Row header = sheet.getRow(0);
        if (header == null) return Collections.emptyMap();
        Map<String, Integer> map = new HashMap<>();
        for (int c = 0; c < header.getLastCellNum(); c++) {
            Cell cell = header.getCell(c);
            if (cell != null) {
                String nome = cell.getStringCellValue().trim().toUpperCase();
                if (!nome.isEmpty()) map.put(nome, c);
            }
        }
        return map;
    }

    private String cell(Row row, Map<String, Integer> colunas, String... nomes) {
        for (String nome : nomes) {
            Integer idx = colunas.get(nome.toUpperCase());
            if (idx != null) {
                Cell cell = row.getCell(idx);
                if (cell != null) {
                    return cellToString(cell);
                }
            }
        }
        return null;
    }

    private String cellToString(Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield new java.text.SimpleDateFormat("dd/MM/yyyy").format(cell.getDateCellValue());
                }
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield cell.getStringCellValue().trim();
                } catch (Exception e) {
                    try {
                        double val = cell.getNumericCellValue();
                        if (val == Math.floor(val)) yield String.valueOf((long) val);
                        yield String.valueOf(val);
                    } catch (Exception e2) {
                        yield "";
                    }
                }
            }
            default -> null;
        };
    }

    private boolean isRowEmpty(Row row) {
        for (int c = 0; c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String val = cellToString(cell);
                if (val != null && !val.isEmpty()) return false;
            }
        }
        return true;
    }

    private BigDecimal parseValor(String valor) {
        if (valor == null || valor.isBlank()) return BigDecimal.ZERO;
        String clean = valor
            .replace("R$", "")
            .replace(" ", "")
            .replace(".", "")
            .replace(",", ".")
            .trim();
        try {
            return new BigDecimal(clean);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private void validarArquivo(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Arquivo excede 10MB");
        }
        String nome = file.getOriginalFilename();
        if (nome == null || (!nome.toLowerCase().endsWith(".xlsx") && !nome.toLowerCase().endsWith(".xls"))) {
            throw new IllegalArgumentException("Apenas arquivos .xlsx são aceitos");
        }
        // Verificar magic bytes (XLSX é um ZIP)
        byte[] header = new byte[4];
        try (InputStream is = file.getInputStream()) {
            if (is.read(header) < 4) {
                throw new IllegalArgumentException("Arquivo corrompido");
            }
        }
        if (header[0] != ZIP_MAGIC[0] || header[1] != ZIP_MAGIC[1]
                || header[2] != ZIP_MAGIC[2] || header[3] != ZIP_MAGIC[3]) {
            throw new IllegalArgumentException("Conteúdo do arquivo não corresponde a uma planilha válida");
        }
    }

    public record ImportResult(String categoria, int total) {}
}
